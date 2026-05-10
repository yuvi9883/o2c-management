package com.o2c.Controller;

import com.o2c.Service.UserProfileService;
import com.o2c.dto.UserProfileDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping
    public ResponseEntity<UserProfileDto.ProfileResponse> getProfile(
            Authentication authentication) {
        // ✅ Gets username directly from JWT token
        String username = authentication.getName();
        System.out.println(">>> Profile GET for: " + username);
        return ResponseEntity.ok(userProfileService.getProfile(username));
    }

    @PutMapping
    public ResponseEntity<UserProfileDto.ProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UserProfileDto.UpdateProfileRequest req) {
        String username = authentication.getName();
        return ResponseEntity.ok(
            userProfileService.updateProfile(username, req)
        );
    }

    @PatchMapping("/change-password")
    public ResponseEntity<UserProfileDto.MessageResponse> changePassword(
            Authentication authentication,
            @Valid @RequestBody UserProfileDto.ChangePasswordRequest req) {
        String username = authentication.getName();
        return ResponseEntity.ok(
            userProfileService.changePassword(username, req)
        );
    }
}