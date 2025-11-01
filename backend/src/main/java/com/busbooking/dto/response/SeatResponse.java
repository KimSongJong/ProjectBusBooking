package com.busbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatResponse {
    private Integer id;
    private Integer vehicleId;
    private String seatNumber;
    private String seatType;
    private String status;
}
