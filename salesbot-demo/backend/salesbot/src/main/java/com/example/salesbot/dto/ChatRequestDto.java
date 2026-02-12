package com.example.salesbot.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatRequestDto {
    private List<Map<String,String>> messages; // [{role:"user"|"bot", content:"..."}]
    private Map<String,Object> context;        // { cart, page, selectedSlot, ... }
}
