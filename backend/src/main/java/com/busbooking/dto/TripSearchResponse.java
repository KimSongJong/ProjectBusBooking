package com.busbooking.dto;

import com.busbooking.model.Trip;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripSearchResponse {
    private List<Trip> outboundTrips;  // Chuyến đi
    private List<Trip> returnTrips;     // Chuyến về (null nếu là vé một chiều)
    private String tripType;            // "oneWay" or "roundTrip"
}

