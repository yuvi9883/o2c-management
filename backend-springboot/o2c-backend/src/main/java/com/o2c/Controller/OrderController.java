package com.o2c.Controller;

import com.o2c.dto.OrderDto;
import com.o2c.Service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // GET /api/orders
    @GetMapping
    public ResponseEntity<List<OrderDto.Response>> getAll() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // GET /api/orders/{orderId}
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDto.Response> getById(
            @PathVariable String orderId) {
        return ResponseEntity.ok(orderService.getByOrderId(orderId));
    }

    // POST /api/orders
    @PostMapping
    public ResponseEntity<OrderDto.Response> create(
            @Valid @RequestBody OrderDto.CreateRequest req) {
        return ResponseEntity.ok(orderService.create(req));
    }

    // PATCH /api/orders/{orderId}/status
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderDto.Response> updateStatus(
            @PathVariable String orderId,
            @RequestBody OrderDto.UpdateStatusRequest req) {
        return ResponseEntity.ok(
                orderService.updateStatus(orderId, req.getStatus()));
    }

    // DELETE /api/orders/{orderId}
    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> delete(@PathVariable String orderId) {
        orderService.delete(orderId);
        return ResponseEntity.noContent().build();
    }
}