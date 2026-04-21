package com.o2c.Controller;

import com.o2c.dto.PaymentDto;
import com.o2c.Service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // GET /api/payments
    @GetMapping
    public ResponseEntity<List<PaymentDto.Response>> getAll() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    // POST /api/payments  — creates payment with PENDING status
    @PostMapping
    public ResponseEntity<PaymentDto.Response> create(
            @Valid @RequestBody PaymentDto.CreateRequest req) {
        return ResponseEntity.ok(paymentService.create(req));
    }

    // PATCH /api/payments/{id}/pay  — marks payment as COMPLETED (user clicks "Pay")
    @PatchMapping("/{id}/pay")
    public ResponseEntity<PaymentDto.Response> markAsPaid(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.markAsPaid(id));
    }

    // GET /api/payments/summary
    @GetMapping("/summary")
    public ResponseEntity<PaymentDto.SummaryResponse> summary() {
        return ResponseEntity.ok(paymentService.getSummary());
    }
}
