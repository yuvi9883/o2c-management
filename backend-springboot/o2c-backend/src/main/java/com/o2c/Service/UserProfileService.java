package com.o2c.Service;

import com.o2c.Repoitory.UserRepository;
import com.o2c.dto.UserProfileDto;
import com.o2c.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Returns the profile of the currently logged-in user.
     * username comes from the JWT token via Spring Security Authentication.
     */
    public UserProfileDto.ProfileResponse getProfile(String username) {
        User user = findUser(username);
        return toResponse(user);
    }

    /**
     * Updates username, fullName, email, mobile.
     * Validates uniqueness for username and mobile before saving.
     */
    @Transactional
    public UserProfileDto.ProfileResponse updateProfile(
            String currentUsername,
            UserProfileDto.UpdateProfileRequest req) {

        User user = findUser(currentUsername);

        // Check if username changed — ensure it's not taken
        if (!req.getUsername().equals(currentUsername)) {
            if (userRepository.existsByUsername(req.getUsername())) {
                throw new RuntimeException("Username '" + req.getUsername() + "' is already taken");
            }
            user.setUsername(req.getUsername());
        }

        // Check if mobile changed — ensure it's not taken
        if (req.getMobile() != null && !req.getMobile().isBlank()
                && !req.getMobile().equals(user.getMobile())) {
            if (userRepository.existsByMobile(req.getMobile())) {
                throw new RuntimeException("Mobile number is already registered");
            }
            user.setMobile(req.getMobile());
        }

        if (req.getFullName() != null) user.setFullName(req.getFullName());
        if (req.getEmail()    != null) user.setEmail(req.getEmail());

        return toResponse(userRepository.save(user));
    }

    /**
     * Changes the user's password.
     * Verifies the current password before updating.
     */
    @Transactional
    public UserProfileDto.MessageResponse changePassword(
            String username,
            UserProfileDto.ChangePasswordRequest req) {

        User user = findUser(username);

        // Verify current password matches stored hash
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // New password and confirm must match
        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new RuntimeException("New password and confirm password do not match");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        return UserProfileDto.MessageResponse.builder()
                .message("Password changed successfully")
                .build();
    }

    // ── private helpers ──────────────────────────────────────────────────────

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    private UserProfileDto.ProfileResponse toResponse(User user) {
        return UserProfileDto.ProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
