package com.o2c.Security;

import com.o2c.Config.JwtConfig;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final JwtConfig jwtConfig;

    public JwtUtil(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(
            jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtConfig.getExpiration()))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    // ✅ This is the validateToken method JwtAuthFilter calls
    public boolean validateToken(String token) {
        try {
            Claims claims = getClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (ExpiredJwtException e) {
            System.out.println("Token expired: " + e.getMessage());
            return false;
        } catch (UnsupportedJwtException e) {
            System.out.println("Token unsupported: " + e.getMessage());
            return false;
        } catch (MalformedJwtException e) {
            System.out.println("Token malformed: " + e.getMessage());
            return false;
        } catch (SignatureException e) {
            System.out.println("Invalid signature: " + e.getMessage());
            return false;
        } catch (IllegalArgumentException e) {
            System.out.println("Token empty: " + e.getMessage());
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}