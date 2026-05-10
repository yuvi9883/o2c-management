package com.o2c.Service;

import com.o2c.Repoitory.UserRepository;
import com.o2c.dto.UserProfileDto;
import com.o2c.entity.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileService(UserRepository userRepository,
                               PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ✅ GET profile
    public UserProfileDto.ProfileResponse getProfile(String username) {
        System.out.println(">>> getProfile: " + username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                    new RuntimeException("User not found: " + username)
                );

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

    // ✅ UPDATE profile
    public UserProfileDto.ProfileResponse updateProfile(
            String username,
            UserProfileDto.UpdateProfileRequest req) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                    new RuntimeException("User not found: " + username)
                );

        // Check new username not taken by someone else
        if (!req.getUsername().equals(username) &&
                userRepository.existsByUsername(req.getUsername())) {
            throw new RuntimeException("Username already taken");
        }

        user.setUsername(req.getUsername());
        user.setFullName(req.getFullName());
        user.setEmail(req.getEmail());
        user.setMobile(req.getMobile());
        userRepository.save(user);

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

    // ✅ CHANGE password
    public UserProfileDto.MessageResponse changePassword(
            String username,
            UserProfileDto.ChangePasswordRequest req) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                    new RuntimeException("User not found: " + username)
                );

        if (!passwordEncoder.matches(
                req.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new RuntimeException(
                "New password and confirm password do not match"
            );
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        return UserProfileDto.MessageResponse.builder()
                .message("Password changed successfully")
                .build();
    }
}