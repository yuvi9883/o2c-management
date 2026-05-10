package com.o2c.Security;

import com.o2c.Repoitory.UserRepository;
import com.o2c.entity.User;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        System.out.println("=== Trying to find user: " + username);

        // ✅ FIXED — search by username field (matches your User entity)
        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                    new UsernameNotFoundException("User not found: " + username)
                );

        System.out.println("=== User found: " + user.getUsername());

        // ✅ Include role from User entity (USER or ADMIN)
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .build();
    }
}