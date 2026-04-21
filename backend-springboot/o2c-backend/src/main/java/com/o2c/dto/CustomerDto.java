package com.o2c.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
public class CustomerDto {

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Customer name is required")
        private String name;
        private String email;
        private String mobile;
        private String city;
        private String address;
    }

    @Data
    public static class Response {
        private Long   id;
        private String name;
        private String email;
        private String mobile;
        private String city;
        private String address;
        private String status;
        private int    totalOrders;
        private String totalSpent;
        private String createdAt;
    }
}