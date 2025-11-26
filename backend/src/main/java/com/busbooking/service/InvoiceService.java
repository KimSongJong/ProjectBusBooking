package com.busbooking.service;

import com.busbooking.dto.request.InvoiceRequest;
import com.busbooking.dto.response.InvoiceResponse;
import com.busbooking.exception.ResourceNotFoundException;
import com.busbooking.mapper.InvoiceMapper;
import com.busbooking.model.Invoice;
import com.busbooking.model.Payment;
import com.busbooking.model.Ticket;
import com.busbooking.model.User;
import com.busbooking.repository.InvoiceRepository;
import com.busbooking.repository.PaymentRepository;
import com.busbooking.repository.TicketRepository;
import com.busbooking.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final InvoiceMapper invoiceMapper;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Integer id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
        return invoiceMapper.toResponse(invoice);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceByNumber(String invoiceNumber) {
        Invoice invoice = invoiceRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with number: " + invoiceNumber));
        return invoiceMapper.toResponse(invoice);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceByBookingGroupId(String bookingGroupId) {
        Invoice invoice = invoiceRepository.findByBookingGroupId(bookingGroupId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found for booking group: " + bookingGroupId));
        return invoiceMapper.toResponse(invoice);
    }

    @Transactional
    public InvoiceResponse createInvoice(InvoiceRequest request) {
        log.info("Creating invoice for booking group: {}", request.getBookingGroupId());

        // Check if invoice already exists for this booking group
        if (invoiceRepository.findByBookingGroupId(request.getBookingGroupId()).isPresent()) {
            throw new IllegalStateException("Invoice already exists for booking group: " + request.getBookingGroupId());
        }

        // Get user
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        // Get payment if provided
        Payment payment = null;
        if (request.getPaymentId() != null) {
            payment = paymentRepository.findById(request.getPaymentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + request.getPaymentId()));
        }

        // Create invoice entity
        Invoice invoice = new Invoice();
        invoice.setBookingGroupId(request.getBookingGroupId());
        invoice.setPayment(payment);
        invoice.setUser(user);
        invoice.setTotalAmount(request.getTotalAmount());
        invoice.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO);
        invoice.setFinalAmount(request.getFinalAmount());
        invoice.setInvoiceData(request.getInvoiceData());

        Invoice savedInvoice = invoiceRepository.save(invoice);
        log.info("Invoice created successfully: {}", savedInvoice.getInvoiceNumber());

        return invoiceMapper.toResponse(savedInvoice);
    }

    @Transactional
    public InvoiceResponse createInvoiceForBookingGroup(String bookingGroupId, Integer paymentId) {
        log.info("Auto-creating invoice for booking group: {}", bookingGroupId);

        // Get all tickets in booking group
        List<Ticket> tickets = ticketRepository.findByBookingGroupId(bookingGroupId);
        if (tickets.isEmpty()) {
            throw new ResourceNotFoundException("No tickets found for booking group: " + bookingGroupId);
        }

        // Get payment
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        // Calculate totals
        BigDecimal totalAmount = tickets.stream()
                .map(Ticket::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate discount (from promotions + online payment discount)
        BigDecimal discountAmount = calculateDiscounts(tickets, payment);
        BigDecimal finalAmount = totalAmount.subtract(discountAmount);

        // Create invoice data JSON
        String invoiceData = createInvoiceDataJson(tickets, payment);

        // Create invoice request
        InvoiceRequest request = new InvoiceRequest();
        request.setBookingGroupId(bookingGroupId);
        request.setPaymentId(paymentId);
        request.setUserId(tickets.get(0).getUser().getId());
        request.setTotalAmount(totalAmount);
        request.setDiscountAmount(discountAmount);
        request.setFinalAmount(finalAmount);
        request.setInvoiceData(invoiceData);

        return createInvoice(request);
    }

    private BigDecimal calculateDiscounts(List<Ticket> tickets, Payment payment) {
        BigDecimal discount = BigDecimal.ZERO;

        // Promotion discounts
        for (Ticket ticket : tickets) {
            if (ticket.getPromotion() != null) {
                if (ticket.getPromotion().getDiscountType().name().equals("percentage")) {
                    BigDecimal promoDiscount = ticket.getPrice()
                            .multiply(ticket.getPromotion().getDiscountValue())
                            .divide(BigDecimal.valueOf(100), java.math.RoundingMode.HALF_UP);
                    discount = discount.add(promoDiscount);
                } else {
                    discount = discount.add(ticket.getPromotion().getDiscountValue());
                }
            }
        }

        // Online payment discount (2%)
        if (payment.getPaymentMethod().name().equals("vnpay") ||
            payment.getPaymentMethod().name().equals("momo")) {
            BigDecimal onlineDiscount = payment.getAmount().multiply(BigDecimal.valueOf(0.02));
            discount = discount.add(onlineDiscount);
        }

        return discount;
    }

    private String createInvoiceDataJson(List<Ticket> tickets, Payment payment) {
        try {
            Map<String, Object> data = new HashMap<>();
            data.put("tickets", tickets);
            data.put("payment", payment);
            data.put("ticketCount", tickets.size());
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            log.error("Error creating invoice data JSON", e);
            return "{}";
        }
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(invoiceMapper::toResponse)
                .toList();
    }
}

