package com.busbooking.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.json.JSONObject;
import org.json.JSONArray;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

/**
 * OpenStreetMap Routing Service using OSRM (Open Source Routing Machine)
 * OSRM API: http://project-osrm.org/
 * Public endpoint: http://router.project-osrm.org/
 */
@Service
@Slf4j
public class OpenStreetMapService {

    private final RestTemplate restTemplate = new RestTemplate();

    // OSRM public API endpoint
    private static final String OSRM_API_URL = "http://router.project-osrm.org/route/v1/driving/";

    /**
     * Calculate distance and duration between two points using OSRM API
     * @param originLat Origin latitude
     * @param originLng Origin longitude
     * @param destLat Destination latitude
     * @param destLng Destination longitude
     * @return Map with "distanceKm", "durationMinutes", "basePrice", "source"
     */
    public Map<String, Object> calculateRouteInfo(
            BigDecimal originLat, BigDecimal originLng,
            BigDecimal destLat, BigDecimal destLng
    ) {
        Map<String, Object> result = new HashMap<>();

        try {
            // Build OSRM API URL
            // Format: http://router.project-osrm.org/route/v1/driving/{longitude},{latitude};{longitude},{latitude}?overview=false
            String url = String.format(
                "%s%s,%s;%s,%s?overview=false&alternatives=false",
                OSRM_API_URL,
                originLng, originLat, // OSRM uses lon,lat order
                destLng, destLat
            );

            log.info("📍 Calling OSRM API: {}", url);

            // Call OSRM API
            String response = restTemplate.getForObject(url, String.class);
            JSONObject json = new JSONObject(response);

            // Check status
            String code = json.getString("code");
            if (!"Ok".equals(code)) {
                log.error("❌ OSRM API error: {}", code);
                return getFallbackCalculation(originLat, originLng, destLat, destLng);
            }

            // Parse response
            JSONArray routes = json.getJSONArray("routes");
            if (routes.length() == 0) {
                log.warn("⚠️ No routes found, using fallback");
                return getFallbackCalculation(originLat, originLng, destLat, destLng);
            }

            JSONObject route = routes.getJSONObject(0);

            // Get distance in meters, convert to km
            double distanceMeters = route.getDouble("distance");
            BigDecimal distanceKm = BigDecimal.valueOf(distanceMeters)
                                              .divide(BigDecimal.valueOf(1000), 2, RoundingMode.HALF_UP);

            // Get duration in seconds, convert to minutes
            double durationSeconds = route.getDouble("duration");
            int durationMinutes = (int) Math.round(durationSeconds / 60);

            // Calculate estimated price
            BigDecimal basePrice = calculatePrice(distanceKm);

            result.put("distanceKm", distanceKm);
            result.put("durationMinutes", durationMinutes);
            result.put("basePrice", basePrice);
            result.put("source", "openstreetmap_osrm");

            log.info("✅ Route calculated via OSRM: {}km, {}min, {}đ", distanceKm, durationMinutes, basePrice);

        } catch (Exception e) {
            log.error("❌ Error calling OSRM API: {}", e.getMessage(), e);
            return getFallbackCalculation(originLat, originLng, destLat, destLng);
        }

        return result;
    }

    /**
     * Calculate ticket price based on distance
     * Formula:
     * - 0-50km: 1500đ/km
     * - 50-150km: 1200đ/km
     * - 150-300km: 1000đ/km
     * - >300km: 800đ/km
     * Minimum: 50,000đ
     */
    private BigDecimal calculatePrice(BigDecimal distanceKm) {
        BigDecimal price;
        double distance = distanceKm.doubleValue();

        if (distance <= 50) {
            // Short distance: 1500đ/km
            price = distanceKm.multiply(BigDecimal.valueOf(1500));
        } else if (distance <= 150) {
            // Medium distance: first 50km at 1500đ/km + rest at 1200đ/km
            BigDecimal firstPart = BigDecimal.valueOf(50).multiply(BigDecimal.valueOf(1500));
            BigDecimal secondPart = distanceKm.subtract(BigDecimal.valueOf(50))
                                              .multiply(BigDecimal.valueOf(1200));
            price = firstPart.add(secondPart);
        } else if (distance <= 300) {
            // Long distance: first 50km + next 100km + rest at 1000đ/km
            BigDecimal firstPart = BigDecimal.valueOf(50).multiply(BigDecimal.valueOf(1500));
            BigDecimal secondPart = BigDecimal.valueOf(100).multiply(BigDecimal.valueOf(1200));
            BigDecimal thirdPart = distanceKm.subtract(BigDecimal.valueOf(150))
                                             .multiply(BigDecimal.valueOf(1000));
            price = firstPart.add(secondPart).add(thirdPart);
        } else {
            // Very long distance: tiered pricing
            BigDecimal firstPart = BigDecimal.valueOf(50).multiply(BigDecimal.valueOf(1500));
            BigDecimal secondPart = BigDecimal.valueOf(100).multiply(BigDecimal.valueOf(1200));
            BigDecimal thirdPart = BigDecimal.valueOf(150).multiply(BigDecimal.valueOf(1000));
            BigDecimal fourthPart = distanceKm.subtract(BigDecimal.valueOf(300))
                                              .multiply(BigDecimal.valueOf(800));
            price = firstPart.add(secondPart).add(thirdPart).add(fourthPart);
        }

        // Round to nearest 1000đ
        price = price.divide(BigDecimal.valueOf(1000), 0, RoundingMode.HALF_UP)
                     .multiply(BigDecimal.valueOf(1000));

        // Minimum price: 50,000đ
        if (price.compareTo(BigDecimal.valueOf(50000)) < 0) {
            price = BigDecimal.valueOf(50000);
        }

        return price;
    }

    /**
     * Fallback calculation using Haversine formula when OSRM API is unavailable
     */
    private Map<String, Object> getFallbackCalculation(
            BigDecimal lat1, BigDecimal lon1,
            BigDecimal lat2, BigDecimal lon2
    ) {
        Map<String, Object> result = new HashMap<>();

        // Haversine formula for great-circle distance
        double earthRadius = 6371; // km

        double dLat = Math.toRadians(lat2.doubleValue() - lat1.doubleValue());
        double dLon = Math.toRadians(lon2.doubleValue() - lon1.doubleValue());

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1.doubleValue())) *
                   Math.cos(Math.toRadians(lat2.doubleValue())) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = earthRadius * c;

        BigDecimal distanceKm = BigDecimal.valueOf(distance).setScale(2, RoundingMode.HALF_UP);

        // Estimate duration: average bus speed 55 km/h (accounting for traffic, stops)
        int durationMinutes = (int) Math.round(distance / 55.0 * 60.0);

        // Calculate price using same formula
        BigDecimal basePrice = calculatePrice(distanceKm);

        result.put("distanceKm", distanceKm);
        result.put("durationMinutes", durationMinutes);
        result.put("basePrice", basePrice);
        result.put("source", "haversine_fallback");

        log.warn("⚠️ Using Haversine fallback calculation: {}km, {}min, {}đ", distanceKm, durationMinutes, basePrice);

        return result;
    }

    /**
     * Get geocoding information for an address (optional feature)
     * Uses Nominatim API: https://nominatim.openstreetmap.org/
     */
    public Map<String, Object> geocodeAddress(String address) {
        Map<String, Object> result = new HashMap<>();

        try {
            String url = String.format(
                "https://nominatim.openstreetmap.org/search?q=%s&format=json&limit=1",
                address.replace(" ", "+")
            );

            log.info("🔍 Geocoding address: {}", address);

            String response = restTemplate.getForObject(url, String.class);
            JSONArray jsonArray = new JSONArray(response);

            if (jsonArray.length() > 0) {
                JSONObject location = jsonArray.getJSONObject(0);
                result.put("latitude", new BigDecimal(location.getString("lat")));
                result.put("longitude", new BigDecimal(location.getString("lon")));
                result.put("displayName", location.getString("display_name"));
                result.put("success", true);

                log.info("✅ Geocoded: {}", location.getString("display_name"));
            } else {
                result.put("success", false);
                result.put("message", "Address not found");
            }

        } catch (Exception e) {
            log.error("❌ Error geocoding address: {}", e.getMessage());
            result.put("success", false);
            result.put("message", "Geocoding error: " + e.getMessage());
        }

        return result;
    }
}

