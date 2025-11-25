package com.busbooking.controller;

import com.busbooking.model.Trip;
import com.busbooking.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/test")
public class TestController {

    @Autowired
    private TripRepository tripRepository;

    @GetMapping("/db-connection")
    public Map<String, Object> testDatabaseConnection() {
        Map<String, Object> result = new HashMap<>();

        try {
            // Test 1: Count all trips
            List<Trip> allTrips = tripRepository.findAll();
            result.put("success", true);
            result.put("total_trips", allTrips.size());

            // Test 2: Count by status
            Map<Trip.Status, Long> statusCount = allTrips.stream()
                    .collect(Collectors.groupingBy(Trip::getStatus, Collectors.counting()));
            result.put("trips_by_status", statusCount);

            // Test 3: Show some scheduled trips
            List<Map<String, Object>> scheduledSample = allTrips.stream()
                    .filter(t -> Trip.Status.scheduled.equals(t.getStatus()))
                    .limit(5)
                    .map(t -> {
                        Map<String, Object> info = new HashMap<>();
                        info.put("id", t.getId());
                        info.put("status", t.getStatus());
                        info.put("has_route", t.getRoute() != null);
                        info.put("has_vehicle", t.getVehicle() != null);
                        if (t.getRoute() != null) {
                            info.put("from", t.getRoute().getFromLocation());
                            info.put("to", t.getRoute().getToLocation());
                        }
                        return info;
                    })
                    .collect(Collectors.toList());
            result.put("scheduled_sample", scheduledSample);

        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("error_class", e.getClass().getName());
            e.printStackTrace();
        }

        return result;
    }
}

