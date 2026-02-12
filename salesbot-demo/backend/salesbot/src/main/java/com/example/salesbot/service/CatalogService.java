package com.example.salesbot.service;

import com.example.salesbot.model.AddOn;
import com.example.salesbot.model.ServiceItem;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CatalogService {

    private final List<ServiceItem> services = new ArrayList<>();

    public CatalogService() {
        // Demo catalog — adjust/extend for your site
        ServiceItem carWash = new ServiceItem("CAR-WASH","Car Wash",1500,new ArrayList<>());
        carWash.getAddOns().add(new AddOn("AO-SNOW","Snow Foam Pre-wash",400));
        carWash.getAddOns().add(new AddOn("AO-WAX","Wax & Shine",700));
        carWash.getAddOns().add(new AddOn("AO-RIM","Rim & Tire Shine",350));
        carWash.getAddOns().add(new AddOn("AO-INT","Interior Vacuum",600));

        ServiceItem oil = new ServiceItem("OIL-CHG","Oil Change",3200,new ArrayList<>());
        oil.getAddOns().add(new AddOn("AO-SYN","Synthetic Oil Upgrade",1200));
        oil.getAddOns().add(new AddOn("AO-FLTR","Premium Filter",800));

        ServiceItem detail = new ServiceItem("DETAIL","Full Detailing",8500,new ArrayList<>());
        detail.getAddOns().add(new AddOn("AO-CLAY","Clay Bar Treatment",1500));
        detail.getAddOns().add(new AddOn("AO-CER","Ceramic Sealant",3000));

        services.add(carWash);
        services.add(oil);
        services.add(detail);
    }

    public List<ServiceItem> all() { return services; }

    public Optional<ServiceItem> byId(String id) {
        return services.stream().filter(s -> s.getId().equalsIgnoreCase(id)).findFirst();
    }
}
