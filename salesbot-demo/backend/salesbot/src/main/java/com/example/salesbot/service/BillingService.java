package com.example.salesbot.service;

import java.util.*;
import org.springframework.stereotype.Service;

import com.example.salesbot.dto.QuoteRequest;
import com.example.salesbot.dto.QuoteResponse;
import com.example.salesbot.model.ServiceItem;

@Service
public class BillingService {

  private final CatalogService catalog;

  public BillingService(CatalogService catalog) {
    this.catalog = catalog;
  }

  public QuoteResponse quote(QuoteRequest req) {
    // ---- prices for services ----
    double serviceSum = req.getServiceIds() == null ? 0.0 :
        req.getServiceIds().stream()
          .map(catalog::byId)
          .filter(Optional::isPresent)
          .map(Optional::get)
          .mapToDouble(ServiceItem::getBasePrice)
          .sum();

    // ---- prices for add-ons ----
    Set<String> addOnIds = new HashSet<>(Optional.ofNullable(req.getAddOnIds()).orElse(List.of()));
    double addOnSum = 0.0;
    if (!addOnIds.isEmpty() && req.getServiceIds() != null) {
      for (String svcId : req.getServiceIds()) {
        Optional<ServiceItem> svc = catalog.byId(svcId);
        if (svc.isEmpty()) continue;
        addOnSum += svc.get().getAddOns().stream()
            .filter(a -> addOnIds.contains(a.getId()))
            .mapToDouble(a -> a.getPrice())
            .sum();
      }
    }

    double subtotal = serviceSum + addOnSum;

    // simple discount example
    double discount = 0.0;
    String note = null;
    if (req.isWeekdayMorning()) {
      discount = Math.round(subtotal * 0.1); // 10%
      note = "Weekday AM promo -10%";
    }

    double total = Math.max(0.0, subtotal - discount);

    return QuoteResponse.builder()
      .subtotal(subtotal)
      .discount(discount)
      .total(total)
      .ruleNote(note)
      .build();
  }
}
