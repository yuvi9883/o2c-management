package com.o2c.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PaymentDto {

    /** Request body for POST /api/payments */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotNull(message = "Invoice ID is required")
        private Long invoiceId;

        @NotNull(message = "Customer ID is required")
        private Long customerId;

        @NotBlank(message = "Payment method is required")
        private String method;   // BANK_TRANSFER | UPI | CHEQUE | CASH | CARD

        @NotNull(message = "Amount is required")
        private BigDecimal amount;
    }

    /** Returned by all payment endpoints */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String paymentId;
        private Long invoiceId;
        private String invoiceNumber;
        private Long customerId;
        private String customerName;
        private String method;
        private String status;       // PENDING | COMPLETED | FAILED
        private BigDecimal amount;
        private LocalDate paymentDate;
        private LocalDateTime createdAt;
    }

    /** Returned by GET /api/payments/summary */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryResponse {
        private BigDecimal totalCollected;   // sum of COMPLETED payments
        private BigDecimal totalPending;     // sum of PENDING payments
        private long completedCount;
        private long pendingCount;
    }
}
