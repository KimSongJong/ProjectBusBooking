package com.busbooking.repository;

import com.busbooking.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Optional<Invoice> findByBookingGroupId(String bookingGroupId);

    Optional<Invoice> findByPaymentId(Integer paymentId);
}

