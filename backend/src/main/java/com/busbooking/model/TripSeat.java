package com.busbooking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "trip_seats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripSeat {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;
    
    @ManyToOne
    @JoinColumn(name = "seat_id")
    private Seat seat;

    @Column(name = "seat_number", nullable = false)
    private String seatNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "seat_type", nullable = false)
    private SeatType seatType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private SeatStatus status = SeatStatus.available;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    public enum SeatType {
        standard, vip, bed
    }
    
    public enum SeatStatus {
        available, booked, locked
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
