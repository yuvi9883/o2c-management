package com.o2c.Repoitory;
import com.o2c.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
 
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    boolean existsByEmail(String email);
    List<Customer> findByStatus(Customer.Status status);
    List<Customer> findByNameContainingIgnoreCase(String name);
}