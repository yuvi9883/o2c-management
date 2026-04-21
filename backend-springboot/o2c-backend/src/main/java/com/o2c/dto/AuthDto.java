package com.o2c.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class AuthDto {

    // ── Send OTP ──────────────────────────────────────────
    @Data
    public static class SendOtpRequest {
        private String mobile;   // frontend sends { mobile: "..." }
    }

    // ── Register ──────────────────────────────────────────
    @Data
    public static class RegisterRequest {
        @NotBlank private String fullName;
        @NotBlank private String username;
        @NotBlank private String mobile;
        private String email;           // optional
        @NotBlank private String password;
        @NotBlank private String otp;
    }

    // ── Login ─────────────────────────────────────────────
    @Data
    public static class LoginRequest {
        @NotBlank private String username;
        @NotBlank private String mobile;
        @NotBlank private String otp;
    }

    // ── Responses ─────────────────────────────────────────
    @Data
    public static class MessageResponse {
        private String message;
        public MessageResponse(String message) {
            this.message = message;
        }
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String username;
        private String fullName;
        public AuthResponse(String token, String username, String fullName) {
            this.token    = token;
            this.username = username;
            this.fullName = fullName;
        }
    }
}