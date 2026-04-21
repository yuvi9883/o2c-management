package com.o2c.Repoitory;

import com.o2c.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByMobile(String mobile);
    boolean existsByUsername(String username);
    boolean existsByMobile(String mobile);
}