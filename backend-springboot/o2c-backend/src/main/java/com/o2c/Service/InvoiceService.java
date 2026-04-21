package com.o2c.Service;

import com.o2c.dto.InvoiceDto;
import com.o2c.entity.Invoice;
import com.o2c.Repoitory.InvoiceRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    // ── Get All Invoices ─────────────────────────────────────
    public List<InvoiceDto.Response> getAllInvoices() {
        return invoiceRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ── Get Invoices By Status ───────────────────────────────
    public List<InvoiceDto.Response> getByStatus(String status) {
        return invoiceRepository
                .findByStatus(parseStatus(status))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ── Get Invoice By ID ────────────────────────────────────
    public InvoiceDto.Response getById(@NonNull Long id) {
        Invoice inv = invoiceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Invoice not found with id: " + id));

        return toResponse(inv);
    }

    // ── Update Invoice Status ────────────────────────────────
    public InvoiceDto.Response updateStatus(@NonNull Long id, String status) {
        Invoice inv = invoiceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Invoice not found with id: " + id));

        inv.setStatus(parseStatus(status));

        return toResponse(invoiceRepository.save(inv));
    }

    // ── Safe Status Parser ───────────────────────────────────
    private Invoice.Status parseStatus(String status) {
        try {
            return Invoice.Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid invoice status: " + status);
        }
    }

    // ── Mapper: Entity → DTO ─────────────────────────────────
    private InvoiceDto.Response toResponse(Invoice i) {
        InvoiceDto.Response r = new InvoiceDto.Response();

        r.setId(i.getId());
        r.setInvoiceNumber(i.getInvoiceNumber());

        // Safe Order handling
        if (i.getOrder() != null) {
            r.setOrderId(i.getOrder().getOrderId());
        }

        // Safe Customer handling
        if (i.getCustomer() != null) {
            r.setCustomerId(i.getCustomer().getId());
            r.setCustomerName(i.getCustomer().getName());
        }

        // Safe Status
        if (i.getStatus() != null) {
            r.setStatus(i.getStatus().name());
        }

        r.setAmount(i.getAmount());
        r.setInvoiceDate(i.getInvoiceDate());
        r.setDueDate(i.getDueDate());

        return r;
    }
}