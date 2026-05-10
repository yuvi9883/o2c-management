package com.o2c.Controller;

import com.o2c.Service.AuthService;
import com.o2c.dto.AuthDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ✅ Step 1 — Send OTP to mobile
    @PostMapping("/send-otp")
    public ResponseEntity<AuthDto.MessageResponse> sendOtp(
            @RequestBody AuthDto.OtpRequest request) {
        authService.sendOtp(request.getMobile());
        return ResponseEntity.ok(
            new AuthDto.MessageResponse("OTP sent to " + request.getMobile())
        );
    }

    // ✅ Step 2 — Verify OTP only (used during registration flow)
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthDto.MessageResponse> verifyOtp(
            @RequestBody AuthDto.OtpVerifyRequest request) {
        authService.verifyOtp(request.getMobile(), request.getOtp());
        return ResponseEntity.ok(
            new AuthDto.MessageResponse("OTP verified successfully")
        );
    }

    // ✅ Step 3 — Register new user
    @PostMapping("/register")
    public ResponseEntity<AuthDto.MessageResponse> register(
            @RequestBody AuthDto.RegisterRequest request) {
        String result = authService.register(request);
        return ResponseEntity.ok(new AuthDto.MessageResponse(result));
    }

    // ✅ Login with username + password
    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(
            @RequestBody AuthDto.LoginRequest request) {
        AuthDto.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    // ✅ Login with username + mobile + OTP
    @PostMapping("/login-otp")
public ResponseEntity<AuthDto.AuthResponse> loginWithOtp(
        @RequestBody AuthDto.OtpLoginRequest request) {
    AuthDto.AuthResponse response = authService.loginWithOtp(request);
    return ResponseEntity.ok(response);
}
}