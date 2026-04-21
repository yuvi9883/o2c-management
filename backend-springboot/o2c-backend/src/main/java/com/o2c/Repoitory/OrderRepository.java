package com.o2c.Repoitory;
 
import com.o2c.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
 
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderId(String orderId);
    List<Order> findByCustomerId(Long customerId);
    List<Order> findByStatus(Order.Status status);
    long countByStatus(Order.Status status);
    List<Order> findTop5ByOrderByCreatedAtDesc();
}
