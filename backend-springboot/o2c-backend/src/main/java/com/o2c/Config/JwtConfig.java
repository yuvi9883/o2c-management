package com.o2c.Config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration                                    // ← ADD THIS
@ConfigurationProperties(prefix = "app.jwt")     // ← was already there
public class JwtConfig {
    private String secret;
    private long expiration;
}