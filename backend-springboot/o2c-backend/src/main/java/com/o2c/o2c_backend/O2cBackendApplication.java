package com.o2c.o2c_backend;

import com.o2c.Config.JwtConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EnableConfigurationProperties(JwtConfig.class)
@ComponentScan(basePackages = "com.o2c")          // ← scans ALL your classes
@EntityScan(basePackages = "com.o2c.entity")      // ← finds your entities
@EnableJpaRepositories(basePackages = "com.o2c.Repoitory") // ← finds your repositories
public class O2cBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(O2cBackendApplication.class, args);
    }
}