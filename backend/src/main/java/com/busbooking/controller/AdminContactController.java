package com.busbooking.controller;

import com.busbooking.model.ContactMessage;
import com.busbooking.service.ContactMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ADMIN endpoint for managing contact/feedback messages
 * Note: context-path is /api (from application.properties), so this maps to /api/admin/contact-messages
 */
@RestController
@RequestMapping("/admin/contact-messages")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminContactController {

    private final ContactMessageService contactMessageService;

    /**
     * GET ALL: Retrieve all contact messages (ADMIN ONLY)
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllContactMessages() {
        try {
            log.info("📋 Admin fetching all contact messages");
            List<ContactMessage> messages = contactMessageService.getAllContactMessages();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Contact messages retrieved successfully");
            response.put("data", messages);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error fetching all contact messages: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch contact messages: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * GET BY ID: Retrieve single contact message (ADMIN ONLY)
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getContactMessageById(@PathVariable Integer id) {
        try {
            log.info("📋 Admin fetching contact message ID: {}", id);
            ContactMessage message = contactMessageService.getContactMessageById(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Contact message retrieved successfully");
            response.put("data", message);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error fetching contact message {}: {}", id, e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch contact message: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * FILTER: Filter contact messages by status and date range (ADMIN ONLY)
     */
    @GetMapping("/filter")
    public ResponseEntity<Map<String, Object>> filterContactMessages(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        try {
            log.info("🔍 Admin filtering contact messages: status={}, startDate={}, endDate={}", status, startDate, endDate);
            List<ContactMessage> messages = contactMessageService.getContactMessagesWithFilters(status, startDate, endDate);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Filtered contact messages retrieved successfully");
            response.put("data", messages);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error filtering contact messages: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to filter contact messages: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * SEARCH: Search contact messages by keyword (ADMIN ONLY)
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchContactMessages(@RequestParam String keyword) {
        try {
            log.info("🔍 Admin searching contact messages: keyword={}", keyword);
            List<ContactMessage> messages = contactMessageService.searchContactMessages(keyword);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Search results retrieved successfully");
            response.put("data", messages);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error searching contact messages: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to search contact messages: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * UPDATE STATUS: Update message status (ADMIN ONLY)
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateMessageStatus(
            @PathVariable Integer id,
            @RequestParam String status
    ) {
        try {
            log.info("🔄 Admin updating message {} status to: {}", id, status);
            ContactMessage updated = contactMessageService.updateStatus(id, status);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Message status updated successfully");
            response.put("data", updated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error updating message status {}: {}", id, e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to update message status: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * DELETE: Delete contact message (ADMIN ONLY)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteContactMessage(@PathVariable Integer id) {
        try {
            log.info("🗑️ Admin deleting contact message ID: {}", id);
            contactMessageService.deleteContactMessage(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Contact message deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error deleting contact message {}: {}", id, e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to delete contact message: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * STATS: Get contact message statistics (ADMIN ONLY)
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getContactMessageStats() {
        try {
            log.info("📊 Admin fetching contact message statistics");
            Map<String, Long> stats = contactMessageService.getStatistics();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Statistics retrieved successfully");
            response.put("data", stats);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error fetching statistics: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch statistics: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}

