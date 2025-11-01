package com.busbooking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;
    
    @ManyToOne
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;
    
    @ManyToOne
    @JoinColumn(name = "promotion_id")
    private Promotion promotion;
    
    @Column(nullable = false)
    private BigDecimal price;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "booking_method", nullable = false)
    private BookingMethod bookingMethod;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.booked;
    
    @Column(name = "booked_at")
    private LocalDateTime bookedAt;
    
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
    
    public enum BookingMethod {
        online, offline
    }
    
    public enum Status {
        booked, confirmed, cancelled
    }
    
    @PrePersist
    protected void onCreate() {
        bookedAt = LocalDateTime.now();
    }
}
