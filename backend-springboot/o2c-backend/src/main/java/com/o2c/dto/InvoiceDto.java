package com.o2c.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
@Getter
@Setter

public class InvoiceDto {

    @Data
    public static class Response {
        private Long       id;
        private String     invoiceNumber;
        private String     orderId;
        private Long       customerId;
        private String     customerName;
        private String     status;
        private BigDecimal amount;
        private LocalDate  invoiceDate;
        private LocalDate  dueDate;
    }

    @Data
    public static class UpdateStatusRequest {
        private String status;
    }
}