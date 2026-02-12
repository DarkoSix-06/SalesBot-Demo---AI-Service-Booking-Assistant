package com.example.salesbot.service;

import com.example.salesbot.model.Booking;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BookingService {
    private final Map<String, Booking> store = new ConcurrentHashMap<>();

    public Booking save(Booking b) {
        if (b.getBookingId() == null) b.setBookingId(UUID.randomUUID().toString());
        store.put(b.getBookingId(), b);
        return b;
    }

    public Optional<Booking> byId(String id){ return Optional.ofNullable(store.get(id)); }
}
