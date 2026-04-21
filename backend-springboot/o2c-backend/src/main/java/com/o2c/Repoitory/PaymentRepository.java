package com.o2c.Repoitory;
 
import com.o2c.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
 
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByCustomerId(Long customerId);
    List<Payment> findByStatus(Payment.Status status);
    List<Payment> findByInvoiceId(Long invoiceId);
}
 