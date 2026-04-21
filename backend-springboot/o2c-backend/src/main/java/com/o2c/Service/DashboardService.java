package com.o2c.Service;

import com.o2c.entity.*;
import com.o2c.Repoitory.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository    orderRepository;
    private final InvoiceRepository  invoiceRepository;
    private final CustomerRepository customerRepository;
    private final PaymentRepository  paymentRepository;

    public Map<String, Object> getSummary() {
        Map<String, Object> data = new LinkedHashMap<>();

        // KPI counts
        data.put("newOrders",
                orderRepository.countByStatus(Order.Status.PENDING));
        data.put("pendingDeliveries",
                orderRepository.countByStatus(Order.Status.SHIPPED));
        data.put("openInvoices",
                invoiceRepository.countByStatus(Invoice.Status.PENDING));
        data.put("totalCustomers",
                customerRepository.count());

        // Total revenue from completed payments
        BigDecimal totalRevenue = paymentRepository.findAll()
                .stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        data.put("totalRevenue", totalRevenue);

        // Invoice stats
        data.put("paidInvoices",
                invoiceRepository.countByStatus(Invoice.Status.PAID));
        data.put("overdueInvoices",
                invoiceRepository.countByStatus(Invoice.Status.OVERDUE));

        // Recent 5 orders
        List<Map<String, Object>> recentOrders =
                orderRepository.findTop5ByOrderByCreatedAtDesc()
                        .stream()
                        .map(o -> {
                            Map<String, Object> m = new LinkedHashMap<>();
                            m.put("orderId",   o.getOrderId());
                            m.put("customer",  o.getCustomer().getName());
                            m.put("status",    o.getStatus().name());
                            m.put("amount",    o.getTotalAmount());
                            m.put("orderDate", o.getOrderDate());
                            return m;
                        })
                        .toList();
        data.put("recentOrders", recentOrders);

        return data;
    }
}