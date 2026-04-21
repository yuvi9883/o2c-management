package com.o2c.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class OrderDto {

    @Data
    public static class CreateRequest {
        @NotNull(message = "Customer ID is required")
        private Long customerId;

        private String shippingAddress;
        private String shippingCity;
        private String shippingPostalCode;
        private String notes;

        @NotNull(message = "Order items are required")
        private List<ItemRequest> items;
    }

    @Data
    public static class ItemRequest {
        @NotBlank(message = "Product name is required")
        private String productName;

        @NotNull(message = "Quantity is required")
        private Integer quantity;

        @NotNull(message = "Unit price is required")
        private BigDecimal unitPrice;
    }

    @Data
    public static class UpdateStatusRequest {
        @NotBlank(message = "Status is required")
        private String status;
    }

    @Data
    public static class Response {
        private Long          id;
        private String        orderId;
        private Long          customerId;
        private String        customerName;
        private String        status;
        private BigDecimal    totalAmount;
        private String        shippingAddress;
        private String        shippingCity;
        private String        shippingPostalCode;
        private String        notes;
        private LocalDate     orderDate;
        private List<ItemResponse> items;
    }

    @Data
    public static class ItemResponse {
        private Long       id;
        private String     productName;
        private Integer    quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
}