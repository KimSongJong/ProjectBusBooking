package com.busbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripSeatResponse {
    private Integer id;
    private Integer tripId;
    private String seatNumber;
    private String seatType;
    private String status;
}
