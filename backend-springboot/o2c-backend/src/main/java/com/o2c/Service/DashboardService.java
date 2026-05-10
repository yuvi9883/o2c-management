package com.o2c.Service;

import com.o2c.Repoitory.*;
import com.o2c.entity.Invoice;
import com.o2c.entity.Order;
import com.o2c.entity.Payment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository     orderRepository;
    private final InvoiceRepository   invoiceRepository;
    private final PaymentRepository   paymentRepository;
    private final CustomerRepository  customerRepository;

    public Map<String, Object> getSummary() {
        Map<String, Object> summary = new HashMap<>();

        // ── Orders ──────────────────────────────────────────
        List<Order> allOrders = orderRepository.findAll();

        summary.put("totalOrders", allOrders.size());

        summary.put("pendingOrders",
            allOrders.stream()
                .filter(o -> o.getStatus() == Order.Status.PENDING)
                .count());

        summary.put("processingOrders",
            allOrders.stream()
                .filter(o -> o.getStatus() == Order.Status.PROCESSING)
                .count());

        summary.put("shippedOrders",
            allOrders.stream()
                .filter(o -> o.getStatus() == Order.Status.SHIPPED)
                .count());

        summary.put("deliveredOrders",
            allOrders.stream()
                .filter(o -> o.getStatus() == Order.Status.DELIVERED)
                .count());

        summary.put("cancelledOrders",
            allOrders.stream()
                .filter(o -> o.getStatus() == Order.Status.CANCELLED)
                .count());

        // ── Invoices ────────────────────────────────────────
        List<Invoice> allInvoices = invoiceRepository.findAll();

        summary.put("totalInvoices", allInvoices.size());

        summary.put("paidInvoices",
            allInvoices.stream()
                .filter(i -> i.getStatus() == Invoice.Status.PAID)
                .count());

        summary.put("pendingInvoices",
            allInvoices.stream()
                .filter(i -> i.getStatus() == Invoice.Status.PENDING)
                .count());

        summary.put("overdueInvoices",
            allInvoices.stream()
                .filter(i -> i.getStatus() == Invoice.Status.OVERDUE)
                .count());

        // ── Payments / Revenue ───────────────────────────────
        List<Payment> allPayments = paymentRepository.findAll();

        BigDecimal totalRevenue = allPayments.stream()
                .filter(p -> p.getStatus() == Payment.Status.COMPLETED)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        summary.put("totalRevenue",   totalRevenue);
        summary.put("totalPayments",  allPayments.size());

        // ── Customers ────────────────────────────────────────
        summary.put("totalCustomers", customerRepository.count());

        return summary;
    }
}