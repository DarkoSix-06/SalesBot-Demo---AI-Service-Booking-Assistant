package com.example.salesbot.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;
import java.util.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChatResponseDto {
    private String reply;
    private List<Suggestion> quickReplies;
    private Map<String,Object> actions;

    public static ChatResponseDto fromJson(String json) {
        try {
            ObjectMapper om = new ObjectMapper();
            ChatResponseDto out = om.readValue(json, ChatResponseDto.class);
            if (out.reply == null || out.reply.isBlank()) out.reply = "Okay.";
            if (out.quickReplies == null) out.quickReplies = List.of();
            if (out.actions == null) out.actions = Map.of();
            return out;
        } catch (Exception e) {
            return ChatResponseDto.builder()
                    .reply(json == null ? "Okay." : json)
                    .quickReplies(List.of())
                    .actions(Map.of())
                    .build();
        }
    }
}
