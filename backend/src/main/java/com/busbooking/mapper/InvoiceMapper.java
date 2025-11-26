package com.busbooking.mapper;

import com.busbooking.dto.response.InvoiceResponse;
import com.busbooking.model.Invoice;
import org.springframework.stereotype.Component;

@Component
public class InvoiceMapper {

    private final PaymentMapper paymentMapper;
    private final UserMapper userMapper;

    public InvoiceMapper(PaymentMapper paymentMapper, UserMapper userMapper) {
        this.paymentMapper = paymentMapper;
        this.userMapper = userMapper;
    }

    public InvoiceResponse toResponse(Invoice invoice) {
        if (invoice == null) {
            return null;
        }

        InvoiceResponse response = new InvoiceResponse();
        response.setId(invoice.getId());
        response.setInvoiceNumber(invoice.getInvoiceNumber());
        response.setBookingGroupId(invoice.getBookingGroupId());
        response.setTotalAmount(invoice.getTotalAmount());
        response.setDiscountAmount(invoice.getDiscountAmount());
        response.setFinalAmount(invoice.getFinalAmount());
        response.setInvoiceData(invoice.getInvoiceData());
        response.setIssuedAt(invoice.getIssuedAt());
        response.setCreatedAt(invoice.getCreatedAt());

        if (invoice.getPayment() != null) {
            response.setPayment(paymentMapper.toResponse(invoice.getPayment()));
        }

        if (invoice.getUser() != null) {
            response.setUser(userMapper.toResponse(invoice.getUser()));
        }

        return response;
    }
}

