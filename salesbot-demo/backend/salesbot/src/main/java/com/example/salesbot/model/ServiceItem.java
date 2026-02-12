package com.example.salesbot.model;

import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class ServiceItem {
    private String id;
    private String name;
    private int basePrice;
    private List<AddOn> addOns = new ArrayList<>();
}
