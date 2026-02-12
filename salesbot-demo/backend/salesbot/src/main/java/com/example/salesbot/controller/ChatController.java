package com.example.salesbot.controller;

import com.example.salesbot.config.GeminiClient;
import com.example.salesbot.model.AddOn;
import com.example.salesbot.model.ServiceItem;
import com.example.salesbot.service.CatalogService;
import com.example.salesbot.util.TimeSlots;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final GeminiClient gemini;
    private final CatalogService catalog;
    private final ObjectMapper om = new ObjectMapper();

    public ChatController(GeminiClient gemini, CatalogService catalog) {
        this.gemini = gemini;
        this.catalog = catalog;
    }

    // ===== DTOs =====
    public record ChatMessage(String role, String content) {
    }

    public record ChatRequest(List<ChatMessage> messages, Map<String, Object> context) {
    }

    public record ChatResponse(String reply, List<Map<String, String>> quickReplies, Map<String, Object> actions) {
    }

    @PostMapping(path = "/chat", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ChatResponse chat(@RequestBody ChatRequest req) {

        // ----- Catalog snapshot -----
        List<ServiceItem> all = catalog.all();
        Map<String, ServiceItem> byId = all.stream()
                .collect(Collectors.toMap(ServiceItem::getId, s -> s));
        Set<String> allowedServiceIds = byId.keySet();

        Map<String, AddOn> addOnIndex = buildAddOnIndex(all);

        // ----- History / last user text -----
        List<Map<String, String>> history = toGeminiHistory(req.messages());
        String lastUser = lastUserUtterance(history);

        // ============ A) SERVICES LIST ============
        if (isTellMeMore(lastUser) && fuzzyFindServiceId(lastUser, all) == null) {
            return askWhichService(all);
        }
        if (isExplicitServicesIntent(lastUser)) {
            return new ChatResponse(
                    "Here are the services we currently offer.",
                    serviceQuickReplies(all, 6),
                    Map.of("recommend", all.stream().map(s -> Map.of("id", s.getId(), "score", 1.0)).toList()));
        }

        // ============ B) SERVICE SELECTED -> OFFER ADD-ONS ============
        String matchedServiceId = fuzzyFindServiceId(lastUser, all);
        if (matchedServiceId != null) {
            ServiceItem svc = byId.get(matchedServiceId);
            Map<String, Object> actions = new LinkedHashMap<>();
            actions.put("recommend", List.of(Map.of("id", matchedServiceId, "score", 1.0)));

            List<Map<String, Object>> options = buildAddOnOptions(svc);
            if (!options.isEmpty()) {
                actions.put("askAddOns", Map.of(
                        "serviceId", matchedServiceId,
                        "options", options));
            }

            String reply = "Great choice! Do you want to add any add-ons for **" + svc.getName() + "**?";
            List<Map<String, String>> q = new ArrayList<>();
            if (!options.isEmpty())
                q.add(Map.of("label", "Add add-ons", "value", "add-ons"));
            q.add(Map.of("label", "Continue", "value", "continue"));
            return new ChatResponse(reply, q, actions);
        }

        // ============ C) CONTINUE -> SUBTOTAL & ASK TIME ============
        if (isContinueIntent(lastUser)) {
            BookingContext bc = parseBookingContext(req.context(), byId, addOnIndex);
            String reply = "Your current subtotal is **LKR %d**. Want me to suggest the next available time, or pick a different slot?"
                    .formatted(bc.subtotal());
            return new ChatResponse(
                    reply,
                    List.of(
                            Map.of("label", "Suggest a time", "value", "suggest time"),
                            Map.of("label", "Pick a different time", "value", "change time")),
                    Map.of("showTimes", true));
        }

        // ============ D) SUGGEST TIME ============
        if (isSuggestTimeIntent(lastUser)) {
            // e.g. "2025-11-01 10:30"
            String slotStr = String.valueOf(TimeSlots.suggestNextSlot());
            String date = slotStr;
            String time = null;
            if (slotStr.contains(" ")) {
                String[] parts = slotStr.split("\\s+", 2);
                date = parts[0];
                time = parts[1];
            }
            Map<String, Object> suggested = new LinkedHashMap<>();
            suggested.put("date", date);
            if (time != null)
                suggested.put("time", time);

            String pretty = (time == null) ? date : (date + " at " + time);
            String reply = "How about **%s**? Shall I confirm this time?".formatted(pretty);

            return new ChatResponse(
                    reply,
                    List.of(
                            Map.of("label", "Confirm time", "value", "confirm time"),
                            Map.of("label", "Change time", "value", "change time")),
                    Map.of("suggestedSlot", suggested));
        }

        // ============ E) CONFIRM SUGGESTED TIME ============
        if (isConfirmTimeIntent(lastUser)) {
            Map<String, Object> ctx = new LinkedHashMap<>(Optional.ofNullable(req.context()).orElseGet(HashMap::new));
            Object sug = ctx.get("suggestedSlot");
            if (sug instanceof Map<?, ?> s) {
                ctx.put("selectedSlot", s); // promote
            }
            BookingContext bc = parseBookingContext(ctx, byId, addOnIndex);
            String date = bc.date, time = bc.time;
            String pretty = (date == null && time == null) ? "the next available slot"
                    : (date == null ? time : (time == null ? date : date + " at " + time));

            String reply = "Great! I’ve selected **%s**. Ready to confirm your booking for **LKR %d**?"
                    .formatted(pretty, bc.subtotal());

            return new ChatResponse(
                    reply,
                    List.of(
                            Map.of("label", "Confirm booking", "value", "confirm booking"),
                            Map.of("label", "Change time", "value", "change time")),
                    Map.of("selectedSlot", ctx.get("selectedSlot")));
        }

        // ============ F) CHANGE TIME -> OPEN BOOKING ============
        if (isChangeTimeIntent(lastUser)) {
            return new ChatResponse(
                    "No problem — I’ve opened the booking page. Pick a slot and then choose **Confirm booking** here.",
                    List.of(Map.of("label", "Back to chat", "value", "continue")),
                    Map.of("navigate", "/booking"));
        }

        // ============ G) CONFIRM BOOKING -> TOTAL & BILLING ============
        if (isConfirmBookingIntent(lastUser)) {
            BookingContext bc = parseBookingContext(req.context(), byId, addOnIndex);
            int total = bc.subtotal();
            String when = (bc.date == null && bc.time == null)
                    ? "your selected time"
                    : ((bc.date == null ? "" : bc.date + " ") + (bc.time == null ? "" : bc.time)).trim();
            String reply = "Awesome! I’ve confirmed your booking for **%s**. Total due: **LKR %d**. Redirecting to billing…"
                    .formatted(when.isBlank() ? "the chosen slot" : when, total);

            return new ChatResponse(reply, List.of(), Map.of("navigate", "/billing"));
        }

        // ============ H) FALLBACK TO GEMINI (GROUNDed) ============
        String system = buildSystemInstruction(all);
        Map<String, Object> schema = buildResponseSchema();
        String jsonText = gemini.chatJson(system, history, 0.4, schema);

        try {
            JsonNode node = om.readTree(jsonText);

            String reply = node.path("reply").asText("OK");

            List<Map<String, String>> quick = new ArrayList<>();
            JsonNode qArr = node.path("quickReplies");
            if (qArr.isArray()) {
                for (JsonNode q : qArr) {
                    String label = q.path("label").asText("");
                    String value = q.path("value").asText("");
                    if (!label.isBlank() && !value.isBlank()) {
                        quick.add(Map.of("label", label, "value", value));
                    }
                }
            }

            Map<String, Object> actions = new LinkedHashMap<>();

            // recommend → keep only valid IDs
            List<Map<String, Object>> recs = new ArrayList<>();
            JsonNode recArr = node.path("actions").path("recommend");
            if (recArr.isArray()) {
                for (JsonNode r : recArr) {
                    String id = r.path("id").asText("");
                    if (allowedServiceIds.contains(id)) {
                        Map<String, Object> one = new LinkedHashMap<>();
                        one.put("id", id);
                        if (r.has("score"))
                            one.put("score", r.path("score").asDouble());
                        recs.add(one);
                    }
                }
            }
            if (!recs.isEmpty())
                actions.put("recommend", recs);

            // askAddOns → keep serviceId, but fill options from our catalog
            JsonNode askAddOns = node.path("actions").path("askAddOns");
            if (askAddOns.isObject()) {
                String sid = askAddOns.path("serviceId").asText("");
                if (allowedServiceIds.contains(sid)) {
                    ServiceItem svc = byId.get(sid);
                    List<Map<String, Object>> options = buildAddOnOptions(svc);
                    if (!options.isEmpty()) {
                        actions.put("askAddOns", Map.of("serviceId", sid, "options", options));
                    }
                }
            }

            return new ChatResponse(reply, quick, actions);

        } catch (Exception e) {
            System.err.println("[ChatController] parse error: " + e.getMessage());
            return new ChatResponse(
                    "Here are our available services. Pick one to continue.",
                    serviceQuickReplies(all, 6),
                    Map.of("recommend", all.stream().map(s -> Map.of("id", s.getId(), "score", 1.0)).toList()));
        }
    }

    // ===== helpers =====

    private List<Map<String, String>> toGeminiHistory(List<ChatMessage> msgs) {
        List<Map<String, String>> history = new ArrayList<>();
        if (msgs != null) {
            for (ChatMessage m : msgs) {
                String role = m.role() == null ? "user" : m.role().toLowerCase(Locale.ROOT);
                if (!role.equals("user") && !role.equals("assistant") && !role.equals("model"))
                    role = "user";
                history.add(Map.of(
                        "role", role.equals("assistant") ? "model" : role,
                        "content", String.valueOf(m.content() == null ? "" : m.content())));
            }
        }
        return history;
    }

    private String lastUserUtterance(List<Map<String, String>> history) {
        for (int i = history.size() - 1; i >= 0; i--) {
            if ("user".equals(history.get(i).get("role")))
                return history.get(i).get("content");
        }
        return "";
    }

    private boolean isTellMeMore(String text) {
        if (text == null)
            return false;
        String t = text.toLowerCase(Locale.ROOT).trim();
        return t.contains("tell me more");
    }

    private boolean isExplicitServicesIntent(String text) {
        if (text == null)
            return false;
        String t = text.toLowerCase(Locale.ROOT).trim();
        return t.equals("show services") || t.equals("list services") || t.equals("see services")
                || t.equals("services") || t.equals("show all services")
                || t.contains("show services") || t.contains("list services");
    }

    private boolean isContinueIntent(String text) {
        if (text == null)
            return false;
        String t = text.toLowerCase(Locale.ROOT);
        return t.equals("continue") || t.contains("go ahead") || t.contains("next");
    }

    private boolean isSuggestTimeIntent(String text) {
        if (text == null)
            return false;
        String t = text.toLowerCase(Locale.ROOT);
        return t.contains("suggest time") || t.contains("recommend a time") || t.contains("best time");
    }

    private boolean isConfirmTimeIntent(String text) {
        if (text == null)
            return false;
        String t = text.toLowerCase(Locale.ROOT);
        return t.equals("confirm time") || t.contains("that works") || t.contains("sounds good");
    }

    private boolean isChangeTimeIntent(String text) {
        if (text == null)
            return false;
        String t = text.toLowerCase(Locale.ROOT);
        return t.contains("change time") || t.contains("pick a different time") || t.contains("different slot");
    }

    private boolean isConfirmBookingIntent(String text) {
        if (text == null)
            return false;
        String t = text.toLowerCase(Locale.ROOT);
        return t.contains("confirm booking") || t.contains("confirm and pay") || t.contains("confirm & pay")
                || t.contains("confirm my booking") || t.contains("confirm this booking");
    }

    private ChatResponse askWhichService(List<ServiceItem> all) {
        return new ChatResponse(
                "Sure — which service are you interested in?",
                serviceQuickReplies(all, 6),
                Map.of("recommend", all.stream().map(s -> Map.of("id", s.getId(), "score", 1.0)).toList()));
    }

    private List<Map<String, String>> serviceQuickReplies(List<ServiceItem> all, int limit) {
        return all.stream()
                .limit(limit)
                .map(s -> Map.of("label", s.getName(), "value", s.getName()))
                .toList();
    }

    /** Lightweight name match; returns a service id or null. */
    private String fuzzyFindServiceId(String text, List<ServiceItem> all) {
        if (text == null)
            return null;
        String t = text.toLowerCase(Locale.ROOT);
        int best = -1;
        String bestId = null;
        for (ServiceItem s : all) {
            int score = 0;
            String n = s.getName().toLowerCase(Locale.ROOT);
            if (t.contains(n))
                score += 4;
            for (String token : n.split("\\s+"))
                if (t.contains(token))
                    score++;
            if (score > best) {
                best = score;
                bestId = s.getId();
            }
        }
        return best >= 2 ? bestId : null;
    }

    private List<Map<String, Object>> buildAddOnOptions(ServiceItem svc) {
        List<Map<String, Object>> options = new ArrayList<>();
        if (svc.getAddOns() != null) {
            for (AddOn a : svc.getAddOns()) {
                options.add(Map.of(
                        "id", a.getId(),
                        "name", a.getName(),
                        "price", a.getPrice()));
            }
        }
        return options;
    }

    /** Build an index of add-ons by id */
    private Map<String, AddOn> buildAddOnIndex(List<ServiceItem> all) {
        Map<String, AddOn> idx = new HashMap<>();
        for (ServiceItem s : all) {
            if (s.getAddOns() == null)
                continue;
            for (AddOn a : s.getAddOns())
                idx.put(a.getId(), a);
        }
        return idx;
    }

    /** Calculate totals and read selected slot from context */
    private BookingContext parseBookingContext(Map<String, Object> ctx,
            Map<String, ServiceItem> byId,
            Map<String, AddOn> addOnIndex) {
        int subtotal = 0;

        if (ctx != null) {
            Object cartObj = ctx.get("cart");
            if (cartObj instanceof Collection<?> col) {
                for (Object o : col) {
                    ServiceItem s = byId.get(String.valueOf(o));
                    if (s != null)
                        subtotal += (int) s.getBasePrice();
                }
            }
            Object addOnIdsObj = ctx.get("addOnIds");
            if (addOnIdsObj instanceof Collection<?> col) {
                for (Object o : col) {
                    AddOn a = addOnIndex.get(String.valueOf(o));
                    if (a != null)
                        subtotal += (int) a.getPrice();
                }
            }
            Object addOnsObj = ctx.get("addOns");
            if (addOnsObj instanceof Map<?, ?> map) {
                for (Object vs : map.values()) {
                    if (vs instanceof Collection<?> col2) {
                        for (Object aidObj : col2) {
                            AddOn a = addOnIndex.get(String.valueOf(aidObj));
                            if (a != null)
                                subtotal += (int) a.getPrice();
                        }
                    }
                }
            }
        }

        String date = null, time = null;
        if (ctx != null) {
            Object slot = ctx.get("selectedSlot");
            if (slot instanceof Map<?, ?> smap) {
                Object d = smap.get("date"), t = smap.get("time");
                if (d != null)
                    date = String.valueOf(d);
                if (t != null)
                    time = String.valueOf(t);
            } else if (slot != null) {
                String s = String.valueOf(slot);
                if (s.contains(" ")) {
                    String[] parts = s.split("\\s+", 2);
                    date = parts[0];
                    time = parts[1];
                } else {
                    date = s;
                }
            }
        }
        return new BookingContext(subtotal, date, time);
    }

    private record BookingContext(int subtotal, String date, String time) {
    }

    /** Grounding prompt with your real catalog */
    private String buildSystemInstruction(List<ServiceItem> all) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
                You are the sales assistant for our car-care site.
                RULES:
                - Only suggest services and add-ons that exist in the catalog below.
                - When recommending, return valid service IDs in actions.recommend.
                - When asking for add-ons, return actions.askAddOns with the selected serviceId;
                  the server will fill the options list from the catalog.
                - Keep replies brief and friendly; offer quickReplies like “Add add-ons”, “Continue”, “Show services”.
                CATALOG (id | name | price | addOnIds):
                """);
        for (ServiceItem s : all) {
            String addOnIds = (s.getAddOns() == null) ? ""
                    : s.getAddOns().stream().map(AddOn::getId).collect(Collectors.joining(","));
            sb.append("%s | %s | %d | %s\n".formatted(
                    s.getId(), s.getName(), (int) s.getBasePrice(), addOnIds));
        }
        return sb.toString();
    }

    /** Schema supported by Gemini REST (no additionalProperties). */
    private Map<String, Object> buildResponseSchema() {
        Map<String, Object> quickItem = new LinkedHashMap<>();
        quickItem.put("type", "object");
        quickItem.put("properties", Map.of(
                "label", Map.of("type", "string"),
                "value", Map.of("type", "string")));
        quickItem.put("required", List.of("label", "value"));

        Map<String, Object> recommendItem = new LinkedHashMap<>();
        recommendItem.put("type", "object");
        recommendItem.put("properties", Map.of(
                "id", Map.of("type", "string"),
                "score", Map.of("type", "number")));
        recommendItem.put("required", List.of("id"));

        Map<String, Object> askAddOnsObj = new LinkedHashMap<>();
        askAddOnsObj.put("type", "object");
        askAddOnsObj.put("properties", Map.of(
                "serviceId", Map.of("type", "string"),
                "options", Map.of(
                        "type", "array",
                        "items", Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "id", Map.of("type", "string"),
                                        "name", Map.of("type", "string"),
                                        "price", Map.of("type", "number")),
                                "required", List.of("id", "name", "price")))));
        askAddOnsObj.put("required", List.of("serviceId"));

        Map<String, Object> actionsObj = new LinkedHashMap<>();
        actionsObj.put("type", "object");
        actionsObj.put("properties", Map.of(
                "recommend", Map.of("type", "array", "items", recommendItem),
                "askAddOns", askAddOnsObj));

        Map<String, Object> root = new LinkedHashMap<>();
        root.put("type", "object");
        root.put("properties", Map.of(
                "reply", Map.of("type", "string"),
                "quickReplies", Map.of("type", "array", "items", quickItem),
                "actions", actionsObj));
        root.put("required", List.of("reply"));
        return root;
    }
}
