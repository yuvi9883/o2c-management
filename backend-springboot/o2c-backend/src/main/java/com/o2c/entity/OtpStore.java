package com.o2c.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_store")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpStore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String mobile;

    @Column(nullable = false)
    private String otp;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column
    private LocalDateTime createdAt;

    // ✅ ADD THIS — was missing, causes the error
    @Column(nullable = false)
    @Builder.Default
    private boolean used = false;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}