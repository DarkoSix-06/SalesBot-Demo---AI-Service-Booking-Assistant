package com.example.salesbot.util;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class TimeSlots {

    /** Returns the next reasonable slot (today + 2h rounded to 30m, business hours 09–17). */
    public static Map<String,String> suggestNextSlot() {
        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime t = now.plusHours(2).withMinute(now.getMinute()<30?30:0).withSecond(0).withNano(0);
        if (t.getHour() < 9) t = t.withHour(9).withMinute(0);
        if (t.getHour() >= 17) t = t.plusDays(1).withHour(9).withMinute(0);

        String date = t.toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE);
        String time = t.toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm"));
        return Map.of("date", date, "time", time);
    }
}
