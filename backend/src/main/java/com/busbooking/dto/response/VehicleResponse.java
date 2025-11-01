package com.busbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    private Integer id;
    private String licensePlate;
    private String model;
    private Integer totalSeats;
    private String seatsLayout;
    private String vehicleType;
    private LocalDateTime createdAt;
}
