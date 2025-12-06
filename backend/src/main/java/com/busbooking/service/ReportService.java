package com.busbooking.service;

import com.busbooking.model.Payment;
import com.busbooking.repository.PaymentRepository;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import net.sf.jasperreports.export.SimpleXlsxReportConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private com.busbooking.repository.TicketRepository ticketRepository;

    /**
     * Generate Payment Report PDF
     */
    public byte[] generatePaymentReportPdf(LocalDate startDate, LocalDate endDate, String status, String paymentMethod) throws Exception {
        // Get payment data
        List<Payment> payments = getFilteredPayments(startDate, endDate, status, paymentMethod);

        // Prepare data for report
        List<Map<String, Object>> reportData = preparePaymentData(payments);

        // Load JRXML template
        ClassPathResource resource = new ClassPathResource("reports/payment_report.jrxml");
        JasperReport jasperReport = JasperCompileManager.compileReport(resource.getInputStream());

        // Parameters
        Map<String, Object> parameters = new HashMap<>();

        // ✅ Dynamic report title based on date filter AND payment method
        String reportTitle = "BÁO CÁO THANH TOÁN";

        // Check if payment method filter is applied
        if (paymentMethod != null && !paymentMethod.isEmpty()) {
            String methodLabel = getPaymentMethodLabel(paymentMethod);
            reportTitle = "BÁO CÁO THANH TOÁN THEO " + methodLabel.toUpperCase();

            // Add date info if exists
            if (startDate != null && endDate != null && startDate.equals(endDate)) {
                reportTitle += " - NGÀY " + startDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            } else if (startDate != null && endDate != null) {
                reportTitle += " (TỪ " + startDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) +
                             " ĐẾN " + endDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + ")";
            }
        } else {
            // No payment method filter, use date-based title
            if (startDate != null && endDate != null && startDate.equals(endDate)) {
                // Single date filter: "DANH SÁCH THANH TOÁN TRONG NGÀY 28/11/2025"
                reportTitle = "DANH SÁCH THANH TOÁN TRONG NGÀY " + startDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            } else if (startDate != null && endDate != null) {
                // Date range filter
                reportTitle = "BÁO CÁO THANH TOÁN TỪ " + startDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) +
                             " ĐẾN " + endDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            }
        }

        parameters.put("reportTitle", reportTitle);
        parameters.put("companyName", "CÔNG TY TPT BUS");
        parameters.put("reportDate", LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        parameters.put("startDate", startDate != null ? startDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "Tất cả");
        parameters.put("endDate", endDate != null ? endDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "Tất cả");
        parameters.put("statusFilter", status != null ? getStatusLabel(status) : "Tất cả");

        // Calculate totals
        double totalAmount = payments.stream()
                .map(Payment::getAmount)
                .map(BigDecimal::doubleValue)
                .mapToDouble(Double::doubleValue)
                .sum();

        long completedCount = payments.stream()
                .filter(p -> Payment.PaymentStatus.completed.equals(p.getPaymentStatus()))
                .count();

        long pendingCount = payments.stream()
                .filter(p -> Payment.PaymentStatus.pending.equals(p.getPaymentStatus()))
                .count();

        parameters.put("totalRecords", payments.size());
        parameters.put("totalAmount", formatCurrency(totalAmount));
        parameters.put("completedCount", completedCount);
        parameters.put("pendingCount", pendingCount);

        // Create data source
        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(reportData);

        // Fill report
        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

        // Export to PDF
        return JasperExportManager.exportReportToPdf(jasperPrint);
    }

    /**
     * Generate Payment Report Excel (simplified - only 6 columns)
     */
    public byte[] generatePaymentReportExcel(LocalDate startDate, LocalDate endDate, String status, String paymentMethod) throws Exception {
        // Get payment data
        List<Payment> payments = getFilteredPayments(startDate, endDate, status, paymentMethod);

        // Prepare data for report (simplified for Excel)
        List<Map<String, Object>> reportData = preparePaymentDataForExcel(payments);

        // ✅ Load simplified Excel template
        ClassPathResource resource = new ClassPathResource("reports/payment_report_excel.jrxml");
        JasperReport jasperReport = JasperCompileManager.compileReport(resource.getInputStream());

        // ✅ No parameters needed for Excel - just data
        Map<String, Object> parameters = new HashMap<>();


        // Create data source
        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(reportData);

        // Fill report
        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

        // Export to Excel
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        JRXlsxExporter exporter = new JRXlsxExporter();
        exporter.setExporterInput(new SimpleExporterInput(jasperPrint));
        exporter.setExporterOutput(new SimpleOutputStreamExporterOutput(outputStream));

        // ✅ Excel-specific configuration to fix column layout
        SimpleXlsxReportConfiguration configuration = new SimpleXlsxReportConfiguration();
        configuration.setOnePagePerSheet(false); // Allow multiple pages in one sheet
        configuration.setDetectCellType(true);
        configuration.setCollapseRowSpan(true); // Prevent row spanning issues
        configuration.setRemoveEmptySpaceBetweenRows(true); // Remove empty rows
        configuration.setRemoveEmptySpaceBetweenColumns(true); // Remove empty columns
        configuration.setWhitePageBackground(false); // Don't add white background cells
        configuration.setIgnorePageMargins(true); // Ignore page margins for cleaner Excel
        configuration.setFontSizeFixEnabled(true); // Fix font size rendering
        configuration.setImageBorderFixEnabled(true); // Fix image borders
        exporter.setConfiguration(configuration);

        exporter.exportReport();

        return outputStream.toByteArray();
    }

    /**
     * Get filtered payments based on criteria
     * Filter by PAYMENT_DATE (ngày xác nhận thanh toán), not created_at
     */
    private List<Payment> getFilteredPayments(LocalDate startDate, LocalDate endDate, String status, String paymentMethod) {
        List<Payment> payments = paymentRepository.findAll();

        return payments.stream()
                .filter(p -> {
                    // ✅ Filter by PAYMENT_DATE (ngày xác nhận thanh toán)
                    if (startDate != null && p.getPaymentDate() != null) {
                        LocalDate paymentDate = p.getPaymentDate().toLocalDate();
                        if (paymentDate.isBefore(startDate)) return false;
                    }
                    if (endDate != null && p.getPaymentDate() != null) {
                        LocalDate paymentDate = p.getPaymentDate().toLocalDate();
                        if (paymentDate.isAfter(endDate)) return false;
                    }
                    // ✅ If no payment_date, exclude from filtered report (pending payments)
                    if ((startDate != null || endDate != null) && p.getPaymentDate() == null) {
                        return false; // Skip pending payments when date filter applied
                    }

                    // ✅ Filter by status (AND condition)
                    if (status != null && !status.equals("all")) {
                        if (!status.equals(p.getPaymentStatus().name())) {
                            return false;
                        }
                    }

                    // ✅ Filter by payment method (AND condition)
                    if (paymentMethod != null && !paymentMethod.equals("all")) {
                        if (!paymentMethod.equalsIgnoreCase(p.getPaymentMethod().name())) {
                            return false;
                        }
                    }

                    return true;
                })
                .sorted(Comparator.comparing(
                        p -> p.getPaymentDate() != null ? p.getPaymentDate() : p.getCreatedAt(),
                        Comparator.reverseOrder()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Prepare payment data for report
     */
    private List<Map<String, Object>> preparePaymentData(List<Payment> payments) {
        List<Map<String, Object>> reportData = new ArrayList<>();
        int index = 1;

        for (Payment payment : payments) {
            Map<String, Object> row = new HashMap<>();
            row.put("stt", index++);
            row.put("paymentId", payment.getId());
            row.put("bookingGroupId", payment.getBookingGroupId() != null ? payment.getBookingGroupId() : "N/A");
            row.put("amount", formatCurrency(payment.getAmount().doubleValue()));
            row.put("paymentMethod", getPaymentMethodLabel(payment.getPaymentMethod().name()));
            row.put("status", getStatusLabel(payment.getPaymentStatus().name())); // ✅ Changed from paymentStatus to status
            row.put("transactionId", payment.getTransactionId() != null ? payment.getTransactionId() : "N/A");
            row.put("paymentDate", payment.getPaymentDate() != null ?
                    payment.getPaymentDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) :
                    "Chưa thanh toán");
            row.put("createdAt", payment.getCreatedAt() != null ?
                    payment.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) :
                    "N/A");

            reportData.add(row);
        }

        return reportData;
    }

    /**
     * Format currency
     */
    private String formatCurrency(double amount) {
        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        return formatter.format(amount);
    }

    /**
     * Prepare payment data for Excel export (simplified - only 6 columns)
     */
    private List<Map<String, Object>> preparePaymentDataForExcel(List<Payment> payments) {
        List<Map<String, Object>> reportData = new ArrayList<>();

        for (Payment payment : payments) {
            Map<String, Object> row = new HashMap<>();

            // Only 6 essential columns
            row.put("paymentId", payment.getId());
            row.put("bookingGroupId", payment.getBookingGroupId() != null ? payment.getBookingGroupId() : "N/A");
            row.put("amount", formatCurrency(payment.getAmount().doubleValue()));
            row.put("paymentMethod", getPaymentMethodLabel(payment.getPaymentMethod().name()));
            row.put("paymentDate", payment.getPaymentDate() != null ?
                    payment.getPaymentDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "Chưa thanh toán");
            row.put("status", getStatusLabel(payment.getPaymentStatus().name()));

            reportData.add(row);
        }

        return reportData;
    }

    /**
     * Get payment method label
     */
    private String getPaymentMethodLabel(String method) {
        if (method == null) return "N/A";
        switch (method.toLowerCase()) {
            case "vnpay": return "VNPay";
            case "momo": return "MoMo";
            case "cash": return "Tiền mặt";
            default: return method;
        }
    }

    /**
     * Get status label
     */
    private String getStatusLabel(String status) {
        if (status == null) return "N/A";
        switch (status.toLowerCase()) {
            case "pending": return "Chờ thanh toán";
            case "completed": return "Đã thanh toán";
            case "failed": return "Thất bại";
            case "refunded": return "Đã hoàn tiền";
            default: return status;
        }
    }

    /**
     * Generate Invoice PDF for single booking
     * This uses the same format as the web invoice display
     */
    public byte[] generateInvoicePdf(String bookingGroupId) throws Exception {
        // Get payment with booking data
        Payment payment = paymentRepository.findByBookingGroupId(bookingGroupId)
                .orElseThrow(() -> new RuntimeException("Payment not found for booking: " + bookingGroupId));

        // Get all tickets for this booking using TicketRepository
        List<com.busbooking.model.Ticket> tickets = ticketRepository.findByBookingGroupId(bookingGroupId);
        if (tickets == null || tickets.isEmpty()) {
            throw new RuntimeException("No tickets found for booking: " + bookingGroupId);
        }

        // Prepare ticket data for report
        List<Map<String, Object>> ticketData = new ArrayList<>();
        double originalPrice = 0.0;

        for (com.busbooking.model.Ticket ticket : tickets) {
            Map<String, Object> row = new HashMap<>();
            row.put("ticketId", ticket.getId());
            row.put("customerName", ticket.getCustomerName());
            row.put("customerPhone", ticket.getCustomerPhone());

            // Trip type
            String tripType = ticket.getIsReturnTrip() != null && ticket.getIsReturnTrip() ? "Chiều về" : "Chiều đi";
            row.put("tripType", tripType);

            // Route name (use fromLocation and toLocation)
            if (ticket.getTrip() != null && ticket.getTrip().getRoute() != null) {
                String routeName = ticket.getTrip().getRoute().getFromLocation() + " → " +
                                 ticket.getTrip().getRoute().getToLocation();
                row.put("routeName", routeName);

                // Departure time
                if (ticket.getTrip().getDepartureTime() != null) {
                    row.put("departureTime", ticket.getTrip().getDepartureTime()
                            .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
                } else {
                    row.put("departureTime", "N/A");
                }
            } else {
                row.put("routeName", "N/A");
                row.put("departureTime", "N/A");
            }

            // Seat number
            if (ticket.getSeat() != null) {
                row.put("seatNumber", ticket.getSeat().getSeatNumber());
            } else {
                row.put("seatNumber", "N/A");
            }

            // Pickup and dropoff points
            row.put("pickupPoint", ticket.getPickupPoint() != null ? ticket.getPickupPoint() : "N/A");
            row.put("dropoffPoint", ticket.getDropoffPoint() != null ? ticket.getDropoffPoint() : "N/A");

            // Price
            if (ticket.getPrice() != null) {
                row.put("price", formatCurrency(ticket.getPrice().doubleValue()));
                originalPrice += ticket.getPrice().doubleValue();
            } else {
                row.put("price", "N/A");
            }

            ticketData.add(row);
        }

        // Create data source
        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(ticketData);

        // Load invoice template
        ClassPathResource resource = new ClassPathResource("reports/invoice_report.jrxml");
        JasperReport jasperReport = JasperCompileManager.compileReport(resource.getInputStream());

        // Prepare parameters
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("companyName", "CÔNG TY TPT BUS");
        parameters.put("bookingGroupId", payment.getBookingGroupId());
        parameters.put("reportDate", LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        parameters.put("paymentMethod", getPaymentMethodLabel(payment.getPaymentMethod().name()));
        parameters.put("paymentDate", payment.getPaymentDate() != null ?
                payment.getPaymentDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "Chưa thanh toán");
        parameters.put("status", getStatusLabel(payment.getPaymentStatus().name()));
        parameters.put("ticketCount", tickets.size());

        // Calculate prices
        parameters.put("originalPrice", formatCurrency(originalPrice));

        // Add promotion info if exists
        double discountAmount = 0.0;
        if (payment.getPromotion() != null) {
            parameters.put("promotionCode", payment.getPromotion().getCode());

            // Calculate discount amount
            if (payment.getPromotion().getDiscountType() == com.busbooking.model.Promotion.DiscountType.percentage) {
                discountAmount = originalPrice * payment.getPromotion().getDiscountValue().doubleValue() / 100.0;
                parameters.put("promotionDiscount", payment.getPromotion().getDiscountValue().intValue() + "%");
            } else {
                discountAmount = payment.getPromotion().getDiscountValue().doubleValue();
                parameters.put("promotionDiscount", formatCurrency(discountAmount));
            }

            parameters.put("discountAmount", formatCurrency(discountAmount));
        } else {
            parameters.put("promotionCode", null);
            parameters.put("promotionDiscount", null);
            parameters.put("discountAmount", null);
        }

        // Final amount (use payment.amount as it's the actual paid amount)
        parameters.put("totalAmount", formatCurrency(payment.getAmount().doubleValue()));

        // Fill report
        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);
        return JasperExportManager.exportReportToPdf(jasperPrint);
    }
}

