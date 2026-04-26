package com.o2c.Service;

import com.o2c.entity.OtpStore;
import com.o2c.Repoitory.OtpStoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpStoreRepository otpStoreRepository;

    public String generateAndSaveOtp(String mobile) {
        // Generate 6-digit OTP
        String otp = String.format("%06d",
                new Random().nextInt(999999));

        OtpStore store = OtpStore.builder()
                .mobile(mobile)
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .used(false)
                .build();

        otpStoreRepository.save(store);

        // ── DEV MODE ──────────────────────────────────────────
        // OTP is printed to the Spring Boot terminal.
        // Replace this with a real SMS gateway in production.
        log.info("========================================");
        log.info("  OTP for {} : {}", mobile, otp);
        log.info("========================================");
        // ──────────────────────────────────────────────────────

        return otp;
    }

    public boolean verifyOtp(String mobile, String otp) {
        Optional<OtpStore> stored =
                otpStoreRepository
                        .findTopByMobileAndUsedFalseOrderByIdDesc(mobile);

        if (stored.isEmpty()) return false;

        OtpStore otpStore = stored.get();

        // Check expiry
        if (otpStore.getExpiresAt().isBefore(LocalDateTime.now()))
            return false;

        // Check OTP value
        if (!otpStore.getOtp().equals(otp))
            return false;

        // Mark as used
        otpStore.setUsed(true);
        otpStoreRepository.save(otpStore);
        return true;
    }
}