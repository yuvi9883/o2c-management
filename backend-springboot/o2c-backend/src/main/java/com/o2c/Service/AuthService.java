package com.o2c.Service;

import com.o2c.Repoitory.UserRepository;
import com.o2c.Security.JwtUtil;
import com.o2c.dto.AuthDto;
import com.o2c.entity.User;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final OtpService otpService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager,
                       OtpService otpService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.otpService = otpService;
    }

    // ✅ SEND OTP — works for any mobile (no user check)
    public String sendOtp(String mobile) {
        otpService.generateAndSaveOtp(mobile);
        return "OTP sent successfully";
    }

    // ✅ VERIFY OTP
    public boolean verifyOtp(String mobile, String otp) {
        boolean verified = otpService.verifyOtp(mobile, otp);
        if (!verified) {
            throw new RuntimeException("Invalid or expired OTP");
        }
        return true;
    }

    // ✅ REGISTER
    public String register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByMobile(request.getMobile())) {
            throw new RuntimeException("Mobile already registered");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .fullName(request.getFullName())
                .mobile(request.getMobile())
                .role(User.Role.USER)
                .active(true)
                .build();

        userRepository.save(user);
        return "User registered successfully";
    }

    // ✅ LOGIN with username + password
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {

    System.out.println(">>> Login attempt: " + request.getUsername());

    try {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );
    } catch (Exception e) {
        // ✅ Print real error so you can see it
        System.out.println(">>> EXACT ERROR: " + e.getClass().getSimpleName());
        System.out.println(">>> MESSAGE: " + e.getMessage());
        throw new RuntimeException("Invalid username or password");
    }

    User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));

    String token = jwtUtil.generateToken(request.getUsername());

    return new AuthDto.AuthResponse(
            token,
            user.getUsername(),
            user.getRole().name()
    );
}

    // ✅ LOGIN with username + mobile + OTP
    public AuthDto.AuthResponse loginWithOtp(AuthDto.OtpLoginRequest request) {

        // 1. Find user by username
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Check mobile matches the user's registered mobile
        if (!user.getMobile().equals(request.getMobile())) {
            throw new RuntimeException(
                "Mobile number does not match this account"
            );
        }

        // 3. Verify OTP
        boolean otpValid = otpService.verifyOtp(
            request.getMobile(), request.getOtp()
        );
        if (!otpValid) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        // 4. Generate and return JWT token
        String token = jwtUtil.generateToken(user.getUsername());

        return new AuthDto.AuthResponse(
                token,
                user.getUsername(),
                user.getRole().name()
        );
    }
}