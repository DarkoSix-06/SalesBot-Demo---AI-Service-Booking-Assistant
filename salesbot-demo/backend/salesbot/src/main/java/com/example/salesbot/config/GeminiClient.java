package com.example.salesbot.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Minimal Gemini REST client (no extra deps).
 * - Short timeouts (fail fast)
 * - Prefers IPv4 (helps on some Windows/VPN setups)
 * - Single attempt per model; quick fallback to a couple of very-available
 * models
 * - Returns structured JSON string that the frontend can render directly
 */
@Component
public class GeminiClient {

    @Value("${gemini.api.key:${GEMINI_API_KEY:}}")
    private String apiKey;

    /** Your preferred model (will be tried first). */
    @Value("${gemini.model:gemini-2.5-flash}")
    private String model;

    /** Fail fast: smaller timeouts than the defaults. */
    @Value("${gemini.connectTimeout.ms:2500}")
    private int connectTimeoutMs;

    @Value("${gemini.readTimeout.ms:7000}")
    private int readTimeoutMs;

    private RestTemplate rt;
    private final ObjectMapper om = new ObjectMapper();

    /** A couple of highly available fallbacks. */
    private static final List<String> FALLBACK_MODELS = List.of(
            "gemini-1.5-flash",
            "gemini-1.5-flash-8b");

    @PostConstruct
    void init() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Gemini API key missing. Set gemini.api.key or GEMINI_API_KEY.");
        }

        // Prefer IPv4 – avoids some IPv6 DNS/route issues.
        System.setProperty("java.net.preferIPv4Stack", "true");

        SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
        f.setConnectTimeout(connectTimeoutMs);
        f.setReadTimeout(readTimeoutMs);
        this.rt = new RestTemplate(f);
    }

    private String endpoint(String modelName) {
        return "https://generativelanguage.googleapis.com/v1beta/models/"
                + modelName + ":generateContent?key=" + apiKey;
    }

    /**
     * Calls Gemini and returns the "text" from candidates[0].content.parts[0] as a
     * JSON string.
     * On errors, returns a small JSON payload the UI can display in the chat.
     */
    public String chatJson(
            String systemInstruction,
            List<Map<String, String>> history,
            double temperature,
            Map<String, Object> responseSchema) {

        // ---- Build contents from chat history ----
        List<Map<String, Object>> contents = new ArrayList<>();
        if (history != null) {
            for (Map<String, String> m : history) {
                String role = String.valueOf(m.getOrDefault("role", "user")).toLowerCase(Locale.ROOT);
                if (!role.equals("user") && !role.equals("assistant") && !role.equals("model"))
                    role = "user";
                // Gemini REST expects "model" (not "assistant")
                String r = role.equals("assistant") ? "model" : role;

                contents.add(Map.of(
                        "role", r,
                        "parts", List.of(Map.of("text", String.valueOf(m.getOrDefault("content", ""))))));
            }
        }

        // ---- Generation config (structured output) ----
        Map<String, Object> gen = new LinkedHashMap<>();
        gen.put("temperature", temperature);
        gen.put("candidateCount", 1);
        gen.put("maxOutputTokens", 1024);
        gen.put("response_mime_type", "application/json");
        if (responseSchema != null) {
            gen.put("response_schema", responseSchema); // v1beta accepts response_schema with generationConfig
        }

        // ---- Request body ----
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("contents", contents);
        body.put("system_instruction", Map.of(
                "role", "system",
                "parts", List.of(Map.of("text", systemInstruction))));
        body.put("generationConfig", gen);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // try primary model, then a couple of quick fallbacks — single attempt each
        List<String> candidates = new ArrayList<>();
        candidates.add(model);
        for (String fb : FALLBACK_MODELS)
            if (!fb.equals(model))
                candidates.add(fb);

        for (String m : candidates) {
            try {
                ResponseEntity<String> res = rt.exchange(
                        endpoint(m), HttpMethod.POST, new HttpEntity<>(body, headers), String.class);

                String raw = res.getBody();
                if (!res.getStatusCode().is2xxSuccessful()) {
                    System.err.printf("[Gemini] HTTP %d model=%s body=%s%n",
                            res.getStatusCodeValue(), m, raw);
                    // try next model quickly
                    continue;
                }
                if (raw == null || raw.isBlank()) {
                    System.err.printf("[Gemini] Empty body model=%s%n", m);
                    continue;
                }

                JsonNode node = om.readTree(raw);
                JsonNode cand = node.path("candidates");
                if (cand.isArray() && cand.size() > 0) {
                    JsonNode textNode = cand.get(0).path("content").path("parts").get(0).path("text");
                    if (!textNode.isMissingNode()) {
                        String text = textNode.asText();
                        if (text != null && !text.isBlank())
                            return text;
                    }
                }

                // Unexpected response shape — surface a friendly error
                System.err.printf("[Gemini] Unexpected response model=%s raw=%s%n", m, raw);
                continue;

            } catch (RestClientResponseException httpEx) {
                // Non-2xx with response body (or proxy errors)
                System.err.printf("[Gemini] HTTP error model=%s status=%d body=%s%n",
                        m, httpEx.getRawStatusCode(), httpEx.getResponseBodyAsString());
                // 403/404 on a model: skip to next candidate immediately
                if (httpEx.getRawStatusCode() == 403 || httpEx.getRawStatusCode() == 404)
                    continue;

            } catch (JsonProcessingException jp) {
                System.err.println("[Gemini] JSON parse error: " + jp.getMessage());
                return errorJson("Gemini JSON parse error.");

            } catch (RuntimeException ex) {
                // Timeouts / DNS / connect issues come here
                System.err.printf("[Gemini] Runtime error model=%s msg=%s%n", m, ex.getMessage());
                // try next model quickly
            }
        }

        // No candidate model succeeded — return a friendly, fast error for the UI.
        return errorJson("Could not reach Gemini (network/timeout).");
    }

    private String errorJson(String msg) {
        return """
                {
                  "reply": "Gemini error: %s",
                  "quickReplies": [{"label":"Show services","value":"show services"}],
                  "actions": {}
                }
                """.formatted(escapeJson(msg));
    }

    private String escapeJson(String s) {
        return s == null ? "" : s.replace("\"", "\\\"");
    }
}
