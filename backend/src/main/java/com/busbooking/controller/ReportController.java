package com.busbooking.controller;

import com.busbooking.service.ReportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Controller for generating reports (PDF, Excel)
 * JasperReports integration
 *
 * ⚠️ NOTE: context-path is /api (in application.properties)
 * So @RequestMapping("/reports") → actual endpoint: /api/reports
 */
@RestController
@RequestMapping("/reports")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ReportController {

    private static final Logger logger = LoggerFactory.getLogger(ReportController.class);

    @Autowired
    private ReportService reportService;

    /**
     * Export Payment Report as PDF
     * GET /api/reports/payments/pdf?startDate=2025-01-01&endDate=2025-12-31&status=completed&paymentMethod=vnpay
     */
    @GetMapping("/payments/pdf")
    @PreAuthorize("hasRole('ADMIN')")  // ✅ Changed from 'admin' to 'ADMIN'
    public ResponseEntity<byte[]> exportPaymentReportPdf(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentMethod) {

        try {
            logger.info("📄 Generating payment report PDF...");
            logger.info("   Start date: {}", startDate);
            logger.info("   End date: {}", endDate);
            logger.info("   Status filter: {}", status);
            logger.info("   Payment method filter: {}", paymentMethod);

            // 🔍 DEBUG: Log current user authorities
            org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                logger.info("🔐 Current user: {}", auth.getName());
                logger.info("🔐 Authorities: {}", auth.getAuthorities());
            } else {
                logger.warn("⚠️ No authentication found!");
            }

            byte[] pdfBytes = reportService.generatePaymentReportPdf(startDate, endDate, status, paymentMethod);

            // Generate filename with date range
            String dateRangeStr = "";
            if (startDate != null && endDate != null) {
                if (startDate.equals(endDate)) {
                    dateRangeStr = startDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
                } else {
                    dateRangeStr = startDate.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "_to_" +
                                   endDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
                }
            } else {
                dateRangeStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            }
            String filename = "Payment_Report_" + dateRangeStr + ".pdf";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            logger.info("✅ PDF generated successfully: {} bytes", pdfBytes.length);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            logger.error("❌ Error generating PDF report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Export Payment Report as Excel
     * GET /api/reports/payments/excel?startDate=2025-01-01&endDate=2025-12-31&status=completed&paymentMethod=vnpay
     */
    @GetMapping("/payments/excel")
    @PreAuthorize("hasRole('ADMIN')")  // ✅ Changed from 'admin' to 'ADMIN'
    public ResponseEntity<byte[]> exportPaymentReportExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentMethod) {

        try {
            logger.info("📊 Generating payment report Excel...");
            logger.info("   Start date: {}", startDate);
            logger.info("   End date: {}", endDate);
            logger.info("   Status filter: {}", status);
            logger.info("   Payment method filter: {}", paymentMethod);

            byte[] excelBytes = reportService.generatePaymentReportExcel(startDate, endDate, status, paymentMethod);

            // Generate filename with date range
            String dateRangeStr = "";
            if (startDate != null && endDate != null) {
                if (startDate.equals(endDate)) {
                    dateRangeStr = startDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
                } else {
                    dateRangeStr = startDate.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "_to_" +
                                   endDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
                }
            } else {
                dateRangeStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            }
            String filename = "Payment_Report_" + dateRangeStr + ".xlsx";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            logger.info("✅ Excel generated successfully: {} bytes", excelBytes.length);

            return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            logger.error("❌ Error generating Excel report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Report service is running");
    }
}

