package com.o2c.Service;

import com.o2c.Repoitory.CustomerRepository;
import com.o2c.Repoitory.InvoiceRepository;
import com.o2c.Repoitory.PaymentRepository;
import com.o2c.dto.PaymentDto;
import com.o2c.entity.Customer;
import com.o2c.entity.Invoice;
import com.o2c.entity.Payment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;

    /** Returns all payments */
    public List<PaymentDto.Response> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Creates a new payment with PENDING status.
     * The user must explicitly click "Pay" to mark it COMPLETED.
     */
    @Transactional
    public PaymentDto.Response create(PaymentDto.CreateRequest req) {
        Invoice invoice = invoiceRepository.findById(req.getInvoiceId())
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + req.getInvoiceId()));

        Customer customer = customerRepository.findById(req.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found: " + req.getCustomerId()));

        Payment payment = Payment.builder()
                .paymentId("PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .invoice(invoice)
                .customer(customer)
                .method(Payment.Method.valueOf(req.getMethod()))
                .amount(req.getAmount())
                .status(Payment.Status.PENDING)   // Always PENDING on creation
                .build();

        return toResponse(paymentRepository.save(payment));
    }

    /**
     * Marks a payment as COMPLETED — called when user clicks the "Pay" button.
     * Also updates the linked invoice status to PAID.
     */
    @Transactional
    public PaymentDto.Response markAsPaid(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + id));

        if (payment.getStatus() == Payment.Status.COMPLETED) {
            throw new RuntimeException("Payment is already completed");
        }

        payment.setStatus(Payment.Status.COMPLETED);
        payment.setPaymentDate(LocalDate.now());

        // Also mark the linked invoice as PAID
        Invoice invoice = payment.getInvoice();
        invoice.setStatus(Invoice.Status.PAID);
        invoiceRepository.save(invoice);

        return toResponse(paymentRepository.save(payment));
    }

    /** Summary of totals by status */
    public PaymentDto.SummaryResponse getSummary() {
        List<Payment> all = paymentRepository.findAll();

        BigDecimal totalCollected = all.stream()
                .filter(p -> p.getStatus() == Payment.Status.COMPLETED)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPending = all.stream()
                .filter(p -> p.getStatus() == Payment.Status.PENDING)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long completedCount = all.stream()
                .filter(p -> p.getStatus() == Payment.Status.COMPLETED)
                .count();

        long pendingCount = all.stream()
                .filter(p -> p.getStatus() == Payment.Status.PENDING)
                .count();

        return PaymentDto.SummaryResponse.builder()
                .totalCollected(totalCollected)
                .totalPending(totalPending)
                .completedCount(completedCount)
                .pendingCount(pendingCount)
                .build();
    }

    // ── helper ───────────────────────────────────────────────────────────────

    private PaymentDto.Response toResponse(Payment p) {
        return PaymentDto.Response.builder()
                .id(p.getId())
                .paymentId(p.getPaymentId())
                .invoiceId(p.getInvoice().getId())
                .invoiceNumber(p.getInvoice().getInvoiceNumber())
                .customerId(p.getCustomer().getId())
                .customerName(p.getCustomer().getName())
                .method(p.getMethod().name())
                .status(p.getStatus().name())
                .amount(p.getAmount())
                .paymentDate(p.getPaymentDate())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
