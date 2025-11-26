package com.busbooking.controller;

import com.busbooking.dto.request.InvoiceRequest;
import com.busbooking.dto.response.ApiResponse;
import com.busbooking.dto.response.InvoiceResponse;
import com.busbooking.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Slf4j
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getAllInvoices() {
        List<InvoiceResponse> invoices = invoiceService.getAllInvoices();
        return ResponseEntity.ok(new ApiResponse<>(true, "Invoices retrieved successfully", invoices));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceById(@PathVariable Integer id) {
        InvoiceResponse invoice = invoiceService.getInvoiceById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Invoice retrieved successfully", invoice));
    }

    @GetMapping("/invoice-number/{invoiceNumber}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceByNumber(@PathVariable String invoiceNumber) {
        InvoiceResponse invoice = invoiceService.getInvoiceByNumber(invoiceNumber);
        return ResponseEntity.ok(new ApiResponse<>(true, "Invoice retrieved successfully", invoice));
    }

    @GetMapping("/booking-group/{bookingGroupId}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceByBookingGroup(@PathVariable String bookingGroupId) {
        InvoiceResponse invoice = invoiceService.getInvoiceByBookingGroupId(bookingGroupId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Invoice retrieved successfully", invoice));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InvoiceResponse>> createInvoice(@Valid @RequestBody InvoiceRequest request) {
        InvoiceResponse invoice = invoiceService.createInvoice(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Invoice created successfully", invoice));
    }

    @PostMapping("/auto-create")
    public ResponseEntity<ApiResponse<InvoiceResponse>> autoCreateInvoice(
            @RequestParam String bookingGroupId,
            @RequestParam Integer paymentId) {
        InvoiceResponse invoice = invoiceService.createInvoiceForBookingGroup(bookingGroupId, paymentId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Invoice auto-created successfully", invoice));
    }
}

