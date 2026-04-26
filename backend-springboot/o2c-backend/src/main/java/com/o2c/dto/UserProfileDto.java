package com.o2c.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class UserProfileDto {

    /** Returned by GET /api/profile and PUT /api/profile */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileResponse {
        private Long id;
        private String username;
        private String fullName;
        private String email;
        private String mobile;
        private String role;
        private LocalDateTime createdAt;
    }

    /** Request body for PUT /api/profile */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProfileRequest {

        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 100, message = "Username must be 3-100 characters")
        private String username;

        private String fullName;

        @Email(message = "Invalid email format")
        private String email;

        private String mobile;
    }

    /** Request body for PATCH /api/profile/change-password */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangePasswordRequest {

        @NotBlank(message = "Current password is required")
        private String currentPassword;

        @NotBlank(message = "New password is required")
        @Size(min = 6, message = "New password must be at least 6 characters")
        private String newPassword;

        @NotBlank(message = "Confirm password is required")
        private String confirmPassword;
    }

    /** Simple message response */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageResponse {
        private String message;
    }
}
