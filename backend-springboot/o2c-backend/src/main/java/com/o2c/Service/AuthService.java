package com.o2c.Service;

import com.o2c.dto.AuthDto;
import com.o2c.entity.User;
import com.o2c.Repoitory.UserRepository;
import com.o2c.Security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final OtpService     otpService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil        jwtUtil;

    // ── Send OTP ──────────────────────────────────────────
    public AuthDto.MessageResponse sendOtp(String mobile) {
        otpService.generateAndSaveOtp(mobile);
        return new AuthDto.MessageResponse(
            "OTP sent successfully. Check the terminal for your OTP.");
    }

    // ── Register ──────────────────────────────────────────
    public AuthDto.MessageResponse register(AuthDto.RegisterRequest req) {

        if (userRepository.existsByUsername(req.getUsername()))
            throw new RuntimeException("Username already exists.");

        if (userRepository.existsByMobile(req.getMobile()))
            throw new RuntimeException("Mobile number already registered.");

        boolean valid = otpService.verifyOtp(req.getMobile(), req.getOtp());
        if (!valid)
            throw new RuntimeException("Invalid or expired OTP.");

        User user = User.builder()
                .fullName(req.getFullName())
                .username(req.getUsername())
                .mobile(req.getMobile())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .build();

        userRepository.save(user);
        return new AuthDto.MessageResponse("Registration successful!");
    }

    // ── Login ─────────────────────────────────────────────
    public AuthDto.AuthResponse login(AuthDto.LoginRequest req) {

        User user = userRepository.findByUsername(req.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (!user.getMobile().equals(req.getMobile()))
            throw new RuntimeException("Mobile number does not match.");

        boolean valid = otpService.verifyOtp(req.getMobile(), req.getOtp());
        if (!valid)
            throw new RuntimeException("Invalid or expired OTP.");

        String token = jwtUtil.generateToken(user.getUsername());
        return new AuthDto.AuthResponse(token, user.getUsername(), user.getFullName());
    }
}