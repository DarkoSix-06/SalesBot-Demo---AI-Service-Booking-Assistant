package com.example.salesbot.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {
    private String bookingId;
    private String[] serviceIds;
    private String date;     // yyyy-MM-dd
    private String time;     // HH:mm
    private String name;
    private String address;
    private String mobile;
    private String email;

    private double subtotal;
    private double discount;
    private double total;
    private String notes;
}
