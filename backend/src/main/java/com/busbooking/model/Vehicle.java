package com.busbooking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "license_plate", nullable = false, unique = true)
    private String licensePlate;
    
    private String model;
    
    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;
    
    @Column(name = "seats_layout", columnDefinition = "TEXT")
    private String seatsLayout;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false)
    private VehicleType vehicleType;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    public enum VehicleType {
        standard, vip, sleeper
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
