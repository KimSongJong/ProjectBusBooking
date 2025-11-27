package com.busbooking.util;

import com.busbooking.model.Ticket;
import com.busbooking.model.Payment;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Utility class to build email template data
 */
@Slf4j
public class EmailTemplateBuilder {

    /**
     * Build ticket confirmation email data for ONE-WAY trip
     */
    public static Map<String, Object> buildOneWayTicketData(Ticket ticket) {
        Map<String, Object> data = new HashMap<>();

        try {
            // Basic info
            data.put("bookingGroupId", ticket.getBookingGroupId());
            data.put("customerName", ticket.getCustomerName());
            data.put("tripType", "one_way");

            // Trip info
            data.put("fromCity", ticket.getTrip().getRoute().getFromLocation());
            data.put("toCity", ticket.getTrip().getRoute().getToLocation());
            data.put("departureTime", ticket.getTrip().getDepartureTime());
            data.put("vehiclePlate", ticket.getTrip().getVehicle().getLicensePlate());
            data.put("vehicleType", ticket.getTrip().getVehicle().getVehicleTypeDisplay());

            // Pickup/Dropoff
            data.put("pickupPoint", ticket.getPickupPoint() != null ? ticket.getPickupPoint() : "Chưa chọn");
            data.put("dropoffPoint", ticket.getDropoffPoint() != null ? ticket.getDropoffPoint() : "Chưa chọn");

            // Seats
            List<String> seats = Collections.singletonList(ticket.getTripSeat().getSeatNumber());
            data.put("seats", seats);

            // Price
            data.put("totalAmount", ticket.getPrice());

            // Expiration
            data.put("expiresAt", ticket.getExpiresAt());

            log.info("✅ Built one-way ticket email data for booking: {}", ticket.getBookingGroupId());

        } catch (Exception e) {
            log.error("❌ Error building one-way ticket email data", e);
        }

        return data;
    }

    /**
     * Build ticket confirmation email data for ROUND-TRIP
     */
    public static Map<String, Object> buildRoundTripTicketData(Ticket outboundTicket, Ticket returnTicket, BigDecimal discountAmount) {
        Map<String, Object> data = new HashMap<>();

        try {
            // Basic info
            data.put("bookingGroupId", outboundTicket.getBookingGroupId());
            data.put("customerName", outboundTicket.getCustomerName());
            data.put("tripType", "round_trip");

            // Outbound trip
            data.put("outboundFromCity", outboundTicket.getTrip().getRoute().getFromLocation());
            data.put("outboundToCity", outboundTicket.getTrip().getRoute().getToLocation());
            data.put("outboundDepartureTime", outboundTicket.getTrip().getDepartureTime());
            data.put("outboundVehiclePlate", outboundTicket.getTrip().getVehicle().getLicensePlate());
            data.put("outboundPickupPoint", outboundTicket.getPickupPoint() != null ? outboundTicket.getPickupPoint() : "Chưa chọn");
            data.put("outboundDropoffPoint", outboundTicket.getDropoffPoint() != null ? outboundTicket.getDropoffPoint() : "Chưa chọn");

            List<String> outboundSeats = Collections.singletonList(outboundTicket.getTripSeat().getSeatNumber());
            data.put("outboundSeats", outboundSeats);

            // Return trip
            data.put("returnFromCity", returnTicket.getTrip().getRoute().getFromLocation());
            data.put("returnToCity", returnTicket.getTrip().getRoute().getToLocation());
            data.put("returnDepartureTime", returnTicket.getTrip().getDepartureTime());
            data.put("returnVehiclePlate", returnTicket.getTrip().getVehicle().getLicensePlate());
            data.put("returnPickupPoint", returnTicket.getPickupPoint() != null ? returnTicket.getPickupPoint() : "Chưa chọn");
            data.put("returnDropoffPoint", returnTicket.getDropoffPoint() != null ? returnTicket.getDropoffPoint() : "Chưa chọn");

            List<String> returnSeats = Collections.singletonList(returnTicket.getTripSeat().getSeatNumber());
            data.put("returnSeats", returnSeats);

            // Price
            BigDecimal totalPrice = outboundTicket.getPrice().add(returnTicket.getPrice());
            data.put("discountAmount", discountAmount != null ? discountAmount : BigDecimal.ZERO);
            data.put("totalAmount", totalPrice.subtract(discountAmount != null ? discountAmount : BigDecimal.ZERO));

            // Expiration (use outbound ticket's expiration)
            data.put("expiresAt", outboundTicket.getExpiresAt());

            log.info("✅ Built round-trip ticket email data for booking: {}", outboundTicket.getBookingGroupId());

        } catch (Exception e) {
            log.error("❌ Error building round-trip ticket email data", e);
        }

        return data;
    }

    /**
     * Build payment invoice email data for ONE-WAY trip
     */
    public static Map<String, Object> buildOneWayInvoiceData(Payment payment, Ticket ticket, String invoiceNumber) {
        Map<String, Object> data = new HashMap<>();

        try {
            // Invoice info
            data.put("invoiceNumber", invoiceNumber);
            data.put("bookingGroupId", payment.getBookingGroupId());
            data.put("issuedAt", LocalDateTime.now());

            // Customer info
            data.put("customerName", ticket.getCustomerName());
            data.put("customerEmail", ticket.getCustomerEmail());
            data.put("customerPhone", ticket.getCustomerPhone());

            // Payment info
            data.put("paymentStatus", payment.getPaymentStatus().toString());
            data.put("paymentMethod", payment.getPaymentMethod().toString().toUpperCase());
            data.put("transactionId", payment.getTransactionId());
            data.put("paymentDate", payment.getPaymentDate());

            // Trip type
            data.put("tripType", "one_way");

            // Trip info
            data.put("fromCity", ticket.getTrip().getRoute().getFromLocation());
            data.put("toCity", ticket.getTrip().getRoute().getToLocation());
            data.put("departureTime", ticket.getTrip().getDepartureTime());
            data.put("vehiclePlate", ticket.getTrip().getVehicle().getLicensePlate());
            data.put("vehicleType", ticket.getTrip().getVehicle().getVehicleTypeDisplay());

            // Seats
            List<String> seats = Collections.singletonList(ticket.getTripSeat().getSeatNumber());
            data.put("seats", seats);

            // Price
            data.put("ticketPrice", ticket.getPrice());
            data.put("subtotalAmount", payment.getAmount());
            data.put("discountAmount", BigDecimal.ZERO);
            data.put("finalAmount", payment.getAmount());

            log.info("✅ Built one-way invoice email data for payment: {}", payment.getId());

        } catch (Exception e) {
            log.error("❌ Error building one-way invoice email data", e);
        }

        return data;
    }

    /**
     * Build payment invoice email data for ROUND-TRIP
     */
    public static Map<String, Object> buildRoundTripInvoiceData(Payment payment, Ticket outboundTicket, Ticket returnTicket,
                                                                  String invoiceNumber, BigDecimal discountAmount) {
        Map<String, Object> data = new HashMap<>();

        try {
            // Invoice info
            data.put("invoiceNumber", invoiceNumber);
            data.put("bookingGroupId", payment.getBookingGroupId());
            data.put("issuedAt", LocalDateTime.now());

            // Customer info
            data.put("customerName", outboundTicket.getCustomerName());
            data.put("customerEmail", outboundTicket.getCustomerEmail());
            data.put("customerPhone", outboundTicket.getCustomerPhone());

            // Payment info
            data.put("paymentStatus", payment.getPaymentStatus().toString());
            data.put("paymentMethod", payment.getPaymentMethod().toString().toUpperCase());
            data.put("transactionId", payment.getTransactionId());
            data.put("paymentDate", payment.getPaymentDate());

            // Trip type
            data.put("tripType", "round_trip");

            // Outbound trip
            data.put("outboundFromCity", outboundTicket.getTrip().getRoute().getFromLocation());
            data.put("outboundToCity", outboundTicket.getTrip().getRoute().getToLocation());
            data.put("outboundDepartureTime", outboundTicket.getTrip().getDepartureTime());
            data.put("outboundVehiclePlate", outboundTicket.getTrip().getVehicle().getLicensePlate());

            List<String> outboundSeats = Collections.singletonList(outboundTicket.getTripSeat().getSeatNumber());
            data.put("outboundSeats", outboundSeats);
            data.put("outboundPrice", outboundTicket.getPrice());

            // Return trip
            data.put("returnFromCity", returnTicket.getTrip().getRoute().getFromLocation());
            data.put("returnToCity", returnTicket.getTrip().getRoute().getToLocation());
            data.put("returnDepartureTime", returnTicket.getTrip().getDepartureTime());
            data.put("returnVehiclePlate", returnTicket.getTrip().getVehicle().getLicensePlate());

            List<String> returnSeats = Collections.singletonList(returnTicket.getTripSeat().getSeatNumber());
            data.put("returnSeats", returnSeats);
            data.put("returnPrice", returnTicket.getPrice());

            // Price
            BigDecimal subtotal = outboundTicket.getPrice().add(returnTicket.getPrice());
            data.put("subtotalAmount", subtotal);
            data.put("discountAmount", discountAmount != null ? discountAmount : BigDecimal.ZERO);
            data.put("finalAmount", payment.getAmount());

            log.info("✅ Built round-trip invoice email data for payment: {}", payment.getId());

        } catch (Exception e) {
            log.error("❌ Error building round-trip invoice email data", e);
        }

        return data;
    }

    /**
     * Generate invoice number
     * Format: INV-YYYYMMDD-XXX
     */
    public static String generateInvoiceNumber() {
        LocalDateTime now = LocalDateTime.now();
        String datePart = String.format("%04d%02d%02d", now.getYear(), now.getMonthValue(), now.getDayOfMonth());
        String randomPart = String.format("%03d", new Random().nextInt(999) + 1);
        return "INV-" + datePart + "-" + randomPart;
    }
}

