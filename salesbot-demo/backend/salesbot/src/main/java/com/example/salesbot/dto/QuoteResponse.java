package com.example.salesbot.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class QuoteResponse {
  private double subtotal;
  private double discount;
  private double total;
  private String ruleNote;
}
