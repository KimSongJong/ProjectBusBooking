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
    @JoinColumn(name = "seat_id")
    private Seat seat;
    
    @ManyToOne
    @JoinColumn(name = "trip_seat_id")
    private TripSeat tripSeat;

    @ManyToOne
    @JoinColumn(name = "promotion_id")
    private Promotion promotion;
    
    @Column(name = "pickup_point")
    private String pickupPoint;

    @Column(name = "dropoff_point")
    private String dropoffPoint;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "customer_phone", length = 20)
    private String customerPhone;

    @Column(name = "customer_email")
    private String customerEmail;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private BigDecimal price;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "booking_method", nullable = false)
    private BookingMethod bookingMethod;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.booked;
    
    // ⭐ NEW: Timestamp fields for ticket lifecycle
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
    
    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "booked_at")
    private LocalDateTime bookedAt;

    // ⭐ NEW: Round trip support fields
    @Enumerated(EnumType.STRING)
    @Column(name = "trip_type", nullable = false)
    private TripType tripType = TripType.one_way;

    @Column(name = "is_return_trip", nullable = false)
    private Boolean isReturnTrip = false;

    @ManyToOne
    @JoinColumn(name = "linked_ticket_id")
    private Ticket linkedTicket;

    @Column(name = "booking_group_id", length = 50)
    private String bookingGroupId;

    public enum BookingMethod {
        online, offline
    }
    
    public enum Status {
        booked,     // Đã đặt (chờ thanh toán)
        confirmed,  // Đã thanh toán
        cancelled   // Đã hủy
    }
    
    public enum TripType {
        one_way,
        round_trip
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (bookedAt == null) {
            bookedAt = LocalDateTime.now();
        }
        // ⭐ Auto-set expiration time: 5 minutes from creation
        if (expiresAt == null && status == Status.booked) {
            expiresAt = createdAt.plusMinutes(5);
        }
    }
}
