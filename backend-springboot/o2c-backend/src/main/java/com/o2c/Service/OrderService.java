package com.o2c.Service;

import com.o2c.dto.OrderDto;
import com.o2c.entity.*;
import com.o2c.Repoitory.CustomerRepository;
import com.o2c.Repoitory.InvoiceRepository;
import com.o2c.Repoitory.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository    orderRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository  invoiceRepository;

    public List<OrderDto.Response> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public OrderDto.Response getByOrderId(String orderId) {
        Order o = orderRepository.findByOrderId(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found: " + orderId));
        return toResponse(o);
    }

    @Transactional
    public OrderDto.Response create(OrderDto.CreateRequest req) {
        Customer customer = customerRepository
                .findById(req.getCustomerId())
                .orElseThrow(() ->
                        new RuntimeException("Customer not found."));

        // Build order first (without items)
        Order order = Order.builder()
                .orderId("SO" + System.currentTimeMillis())
                .customer(customer)
                .shippingAddress(req.getShippingAddress())
                .shippingCity(req.getShippingCity())
                .shippingPostalCode(req.getShippingPostalCode())
                .notes(req.getNotes())
                .status(Order.Status.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .build();

        // Build items and link to order
        List<OrderItem> items = req.getItems().stream().map(i -> {
            BigDecimal total = i.getUnitPrice()
                    .multiply(BigDecimal.valueOf(i.getQuantity()));
            return OrderItem.builder()
                    .order(order)
                    .productName(i.getProductName())
                    .quantity(i.getQuantity())
                    .unitPrice(i.getUnitPrice())
                    .totalPrice(total)
                    .build();
        }).collect(Collectors.toList());

        // Calculate total
        BigDecimal total = items.stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setItems(items);
        order.setTotalAmount(total);

        Order saved = orderRepository.save(order);

        // Auto-create invoice for the order
        Invoice invoice = Invoice.builder()
                .invoiceNumber("INV" + System.currentTimeMillis())
                .order(saved)
                .customer(customer)
                .amount(total)
                .status(Invoice.Status.PENDING)
                .build();
        invoiceRepository.save(invoice);

        return toResponse(saved);
    }

    @Transactional
    public OrderDto.Response updateStatus(String orderId, String status) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found."));
        order.setStatus(Order.Status.valueOf(status.toUpperCase()));
        return toResponse(orderRepository.save(order));
    }

    public void delete(String orderId) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found."));
        orderRepository.delete(order);
    }

    // ── Mapper ───────────────────────────────────────────────
    private OrderDto.Response toResponse(Order o) {
        OrderDto.Response r = new OrderDto.Response();
        r.setId(o.getId());
        r.setOrderId(o.getOrderId());
        r.setCustomerId(o.getCustomer().getId());
        r.setCustomerName(o.getCustomer().getName());
        r.setStatus(o.getStatus().name());
        r.setTotalAmount(o.getTotalAmount());
        r.setShippingAddress(o.getShippingAddress());
        r.setShippingCity(o.getShippingCity());
        r.setShippingPostalCode(o.getShippingPostalCode());
        r.setNotes(o.getNotes());
        r.setOrderDate(o.getOrderDate());

        if (o.getItems() != null) {
            r.setItems(o.getItems().stream().map(i -> {
                OrderDto.ItemResponse ir = new OrderDto.ItemResponse();
                ir.setId(i.getId());
                ir.setProductName(i.getProductName());
                ir.setQuantity(i.getQuantity());
                ir.setUnitPrice(i.getUnitPrice());
                ir.setTotalPrice(i.getTotalPrice());
                return ir;
            }).collect(Collectors.toList()));
        }
        return r;
    }
}