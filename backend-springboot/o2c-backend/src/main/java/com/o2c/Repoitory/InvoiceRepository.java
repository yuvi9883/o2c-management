package com.o2c.Repoitory;
 
import com.o2c.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
 
@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByStatus(Invoice.Status status);
    List<Invoice> findByCustomerId(Long customerId);
    List<Invoice> findByOrderId(Long orderId);
    long countByStatus(Invoice.Status status);
}
 