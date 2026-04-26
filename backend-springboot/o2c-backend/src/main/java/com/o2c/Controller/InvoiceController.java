package com.o2c.Controller;

import com.o2c.dto.InvoiceDto;
import com.o2c.Service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    // GET /api/invoices  or  /api/invoices?status=PAID
    @GetMapping
    public ResponseEntity<List<InvoiceDto.Response>> getAll(
            @RequestParam(required = false) String status) {
        if (status != null && !status.isBlank())
            return ResponseEntity.ok(invoiceService.getByStatus(status));
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    // GET /api/invoices/{id}
    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDto.Response> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getById(id));
    }

    // PATCH /api/invoices/{id}/status
    @PatchMapping("/{id}/status")
    public ResponseEntity<InvoiceDto.Response> updateStatus(
            @PathVariable Long id,
            @RequestBody InvoiceDto.UpdateStatusRequest req) {
        return ResponseEntity.ok(
                invoiceService.updateStatus(id, req.getStatus()));
    }
}