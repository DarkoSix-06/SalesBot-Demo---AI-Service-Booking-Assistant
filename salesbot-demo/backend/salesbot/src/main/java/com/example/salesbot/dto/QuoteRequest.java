package com.example.salesbot.dto;

import java.util.List;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class QuoteRequest {
  private List<String> serviceIds;           // e.g. ["car-wash","oil-change"]
  private List<String> addOnIds;             // e.g. ["wax-shine","premium-filter"]
  private String carSize;                    // optional (for future rules)
  private boolean weekdayMorning;            // optional (for discounts)
}
