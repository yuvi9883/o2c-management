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
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    /**
     * GET /api/profile
     * Returns the logged-in user's profile.
     * Spring Security reads the username from the JWT token automatically.
     */
    @GetMapping
    public ResponseEntity<UserProfileDto.ProfileResponse> getProfile(
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(userProfileService.getProfile(username));
    }

    /**
     * PUT /api/profile
     * Update username, fullName, email, mobile.
     */
    @PutMapping
    public ResponseEntity<UserProfileDto.ProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UserProfileDto.UpdateProfileRequest req) {
        String username = authentication.getName();
        return ResponseEntity.ok(userProfileService.updateProfile(username, req));
    }

    /**
     * PATCH /api/profile/change-password
     * Change password — verifies old password first.
     */
    @PatchMapping("/change-password")
    public ResponseEntity<UserProfileDto.MessageResponse> changePassword(
            Authentication authentication,
            @Valid @RequestBody UserProfileDto.ChangePasswordRequest req) {
        String username = authentication.getName();
        return ResponseEntity.ok(userProfileService.changePassword(username, req));
    }
}
