package com.example.salesbot.controller;

import java.util.*;
import org.springframework.web.bind.annotation.*;

import com.example.salesbot.dto.QuoteRequest;
import com.example.salesbot.dto.QuoteResponse;
import com.example.salesbot.model.Booking;
import com.example.salesbot.service.BillingService;
import com.example.salesbot.service.BookingService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

  private final BillingService billing;
  private final BookingService booking;

  public BookingController(BillingService billing, BookingService booking) {
    this.billing = billing;
    this.booking = booking;
  }

  @PostMapping("/quote")
  public QuoteResponse quote(@RequestBody QuoteRequest req){
    return billing.quote(req);
  }

  @PostMapping("/book")
  public Map<String,Object> book(@RequestBody Booking req){
    Booking saved = booking.save(req);
    return Map.of("bookingId", saved.getBookingId());
  }

  @GetMapping("/slot/suggest")
  public Object slot(){ return Map.of("next", "Tomorrow 10:30 AM"); }
}
