package com.example.salesbot.controller;

import com.example.salesbot.model.ServiceItem;
import com.example.salesbot.service.CatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ServiceController {

    private final CatalogService catalog;

    @GetMapping("/services")
    public List<ServiceItem> list() {
        return catalog.all();
    }
}
