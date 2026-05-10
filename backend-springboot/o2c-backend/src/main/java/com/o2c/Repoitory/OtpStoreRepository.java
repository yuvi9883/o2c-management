package com.o2c.Repoitory;

import com.o2c.entity.OtpStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Optional;

public interface OtpStoreRepository extends JpaRepository<OtpStore, Long> {

    Optional<OtpStore> findByMobile(String mobile);

    // ✅ This is what OtpService calls — must exist
    Optional<OtpStore> findTopByMobileAndUsedFalseOrderByIdDesc(String mobile);

    boolean existsByMobile(String mobile);

    @Modifying
    @Transactional
    void deleteByMobile(String mobile);

    @Modifying
    @Transactional
    @Query("DELETE FROM OtpStore o WHERE o.expiresAt < :now")
    void deleteExpiredOtps(LocalDateTime now);
}