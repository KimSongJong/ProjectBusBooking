package com.busbooking.service;

import com.busbooking.model.ContactMessage;
import com.busbooking.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContactMessageService {

    private final ContactMessageRepository contactMessageRepository;

    /**
     * Create new contact message
     */
    @Transactional
    public ContactMessage createContactMessage(ContactMessage contactMessage) {
        log.info("📩 Creating new contact message from: {}", contactMessage.getEmail());
        return contactMessageRepository.save(contactMessage);
    }

    /**
     * Get all contact messages (for admin)
     */
    public List<ContactMessage> getAllMessages() {
        log.info("📋 Fetching all contact messages");
        return contactMessageRepository.findAll();
    }

    /**
     * Get contact message by ID (for admin)
     */
    public ContactMessage getMessageById(Integer id) {
        return contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact message not found with id: " + id));
    }

    /**
     * Get contact messages by status
     */
    public List<ContactMessage> getContactMessagesByStatus(String status) {
        log.info("🔍 Fetching contact messages with status: {}", status);
        return contactMessageRepository.findByStatus(status);
    }

    /**
     * Get contact messages by date range
     */
    public List<ContactMessage> getContactMessagesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("📅 Fetching contact messages from {} to {}", startDate, endDate);
        return contactMessageRepository.findByDateRange(startDate, endDate);
    }

    /**
     * Search contact messages by keyword
     */
    public List<ContactMessage> searchContactMessages(String keyword) {
        log.info("🔎 Searching contact messages with keyword: {}", keyword);
        return contactMessageRepository.searchByKeyword(keyword);
    }

    /**
     * Get contact messages with filters
     */
    public List<ContactMessage> getContactMessagesWithFilters(String status, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("🔍 Fetching contact messages with filters - Status: {}, From: {}, To: {}", status, startDate, endDate);
        return contactMessageRepository.findByFilters(status, startDate, endDate);
    }

    /**
     * Update contact message status
     */
    @Transactional
    public ContactMessage updateStatus(Integer id, String newStatus) {
        log.info("✏️ Updating status for message ID {} to: {}", id, newStatus);

        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact message not found with id: " + id));

        message.setStatus(newStatus);
        return contactMessageRepository.save(message);
    }

    /**
     * Delete contact message (for admin)
     */
    @Transactional
    public void deleteMessage(Integer id) {
        log.info("🗑️ Deleting contact message with ID: {}", id);
        contactMessageRepository.deleteById(id);
    }

    /**
     * Filter messages by status and date range (for admin)
     */
    public List<ContactMessage> filterMessages(String status, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("🔍 Filtering messages - Status: {}, From: {}, To: {}", status, startDate, endDate);
        return contactMessageRepository.findByFilters(status, startDate, endDate);
    }

    /**
     * Search messages by keyword (for admin)
     */
    public List<ContactMessage> searchMessages(String keyword) {
        log.info("🔎 Searching messages with keyword: {}", keyword);
        return contactMessageRepository.searchByKeyword(keyword);
    }

    /**
     * Get statistics (for admin dashboard)
     */
    public java.util.Map<String, Long> getStatistics() {
        log.info("📊 Calculating contact message statistics");
        List<ContactMessage> allMessages = contactMessageRepository.findAll();

        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("total", (long) allMessages.size());
        stats.put("pending", allMessages.stream().filter(m -> "pending".equals(m.getStatus())).count());
        stats.put("read", allMessages.stream().filter(m -> "read".equals(m.getStatus())).count());
        stats.put("resolved", allMessages.stream().filter(m -> "resolved".equals(m.getStatus())).count());

        return stats;
    }

    // ============================================
    // ALIAS METHODS for ContactMessageController
    // ============================================

    /**
     * Alias for getAllMessages() - used by ContactMessageController
     */
    public List<ContactMessage> getAllContactMessages() {
        return getAllMessages();
    }

    /**
     * Alias for getMessageById() - used by ContactMessageController
     */
    public ContactMessage getContactMessageById(Integer id) {
        return getMessageById(id);
    }

    /**
     * Alias for deleteMessage() - used by ContactMessageController
     */
    @Transactional
    public void deleteContactMessage(Integer id) {
        deleteMessage(id);
    }
}

