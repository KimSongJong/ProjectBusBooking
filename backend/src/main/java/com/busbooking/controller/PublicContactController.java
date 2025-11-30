package com.busbooking.controller;

import com.busbooking.model.ContactMessage;
import com.busbooking.service.ContactMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * PUBLIC endpoint for customers to submit contact/feedback messages
 */
@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class PublicContactController {

    private final ContactMessageService contactMessageService;

    /**
     * CREATE: Customer submits contact message (PUBLIC - NO AUTH REQUIRED)
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createContactMessage(@RequestBody ContactMessage contactMessage) {
        try {
            log.info("📩 Received contact message from: {}", contactMessage.getEmail());
            ContactMessage saved = contactMessageService.createContactMessage(contactMessage);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Contact message sent successfully");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error creating contact message: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to send contact message: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}

