package com.o2c.dto;

import lombok.Data;

public class AuthDto {

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class RegisterRequest {
        private String username;
        private String password;
        private String email;
        private String fullName;
        private String mobile;
    }

    @Data
    public static class OtpRequest {
        private String mobile;
    }

    @Data
    public static class OtpVerifyRequest {
        private String mobile;
        private String otp;
    }

    // ✅ NEW — for OTP based login
    @Data
    public static class OtpLoginRequest {
        private String username;
        private String mobile;
        private String otp;
    }
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
        private String role;

        public AuthResponse(String token, String username, String role) {
            this.token = token;
            this.username = username;
            this.role = role;
        }
    }
}