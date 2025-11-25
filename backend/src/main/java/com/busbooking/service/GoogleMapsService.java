package com.busbooking.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.json.JSONObject;
import org.json.JSONArray;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class GoogleMapsService {

    @Value("${google.maps.api.key:YOUR_API_KEY_HERE}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Calculate distance and duration between two points using Google Distance Matrix API
     * @param originLat Origin latitude
     * @param originLng Origin longitude
     * @param destLat Destination latitude
     * @param destLng Destination longitude
     * @return Map with "distanceKm", "durationMinutes", "estimatedPrice"
     */
    public Map<String, Object> calculateRouteInfo(
            BigDecimal originLat, BigDecimal originLng,
            BigDecimal destLat, BigDecimal destLng
    ) {
        Map<String, Object> result = new HashMap<>();

        try {
            // Build API URL
            String url = String.format(
                "https://maps.googleapis.com/maps/api/distancematrix/json?origins=%s,%s&destinations=%s,%s&key=%s&mode=driving",
                originLat, originLng, destLat, destLng, apiKey
            );

            log.info("📍 Calling Google Maps API: {}", url.replace(apiKey, "***"));

            // Call API
            String response = restTemplate.getForObject(url, String.class);
            JSONObject json = new JSONObject(response);

            // Check status
            String status = json.getString("status");
            if (!"OK".equals(status)) {
                log.error("❌ Google Maps API error: {}", status);
                return getFallbackCalculation(originLat, originLng, destLat, destLng);
            }

            // Parse response
            JSONArray rows = json.getJSONArray("rows");
            if (rows.length() == 0) {
                return getFallbackCalculation(originLat, originLng, destLat, destLng);
            }

            JSONObject element = rows.getJSONObject(0)
                                    .getJSONArray("elements")
                                    .getJSONObject(0);

            String elementStatus = element.getString("status");
            if (!"OK".equals(elementStatus)) {
                return getFallbackCalculation(originLat, originLng, destLat, destLng);
            }

            // Get distance in meters, convert to km
            int distanceMeters = element.getJSONObject("distance").getInt("value");
            BigDecimal distanceKm = BigDecimal.valueOf(distanceMeters)
                                              .divide(BigDecimal.valueOf(1000), 2, RoundingMode.HALF_UP);

            // Get duration in seconds, convert to minutes
            int durationSeconds = element.getJSONObject("duration").getInt("value");
            int durationMinutes = durationSeconds / 60;

            // Calculate estimated price: 1000 VND per km, minimum 50000 VND
            BigDecimal basePrice = distanceKm.multiply(BigDecimal.valueOf(1000))
                                             .setScale(0, RoundingMode.HALF_UP);
            if (basePrice.compareTo(BigDecimal.valueOf(50000)) < 0) {
                basePrice = BigDecimal.valueOf(50000);
            }

            result.put("distanceKm", distanceKm);
            result.put("durationMinutes", durationMinutes);
            result.put("basePrice", basePrice);
            result.put("source", "google_maps");

            log.info("✅ Route calculated: {}km, {}min, {}đ", distanceKm, durationMinutes, basePrice);

        } catch (Exception e) {
            log.error("❌ Error calling Google Maps API: {}", e.getMessage());
            return getFallbackCalculation(originLat, originLng, destLat, destLng);
        }

        return result;
    }

    /**
     * Fallback calculation using Haversine formula
     */
    private Map<String, Object> getFallbackCalculation(
            BigDecimal lat1, BigDecimal lon1,
            BigDecimal lat2, BigDecimal lon2
    ) {
        Map<String, Object> result = new HashMap<>();

        // Haversine formula for distance
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

        // Estimate duration: average speed 60 km/h
        int durationMinutes = (int) (distance / 60.0 * 60.0);

        // Calculate price
        BigDecimal basePrice = distanceKm.multiply(BigDecimal.valueOf(1000))
                                         .setScale(0, RoundingMode.HALF_UP);
        if (basePrice.compareTo(BigDecimal.valueOf(50000)) < 0) {
            basePrice = BigDecimal.valueOf(50000);
        }

        result.put("distanceKm", distanceKm);
        result.put("durationMinutes", durationMinutes);
        result.put("basePrice", basePrice);
        result.put("source", "haversine_fallback");

        log.warn("⚠️ Using fallback calculation: {}km, {}min, {}đ", distanceKm, durationMinutes, basePrice);

        return result;
    }

    /**
     * Validate if API key is configured
     */
    public boolean isApiKeyConfigured() {
        return apiKey != null && !apiKey.equals("YOUR_API_KEY_HERE") && !apiKey.isEmpty();
    }
}

