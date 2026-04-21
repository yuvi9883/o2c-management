package com.o2c.Controller;

import com.o2c.dto.AuthDto;
import com.o2c.Service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")   // ← safety net in case CORS config fails
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/send-otp")
    public ResponseEntity<AuthDto.MessageResponse> sendOtp(
            @RequestBody AuthDto.SendOtpRequest req) {
        return ResponseEntity.ok(
                authService.sendOtp(req.getMobile()));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthDto.MessageResponse> register(
            @Valid @RequestBody AuthDto.RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(
            @Valid @RequestBody AuthDto.LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }
}