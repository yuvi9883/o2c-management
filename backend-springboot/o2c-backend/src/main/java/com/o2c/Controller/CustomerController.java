package com.o2c.Controller;

import com.o2c.dto.CustomerDto;
import com.o2c.Service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    // GET /api/customers
    @GetMapping
    public ResponseEntity<List<CustomerDto.Response>> getAll() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    // GET /api/customers/{id}
    @GetMapping("/{id}")
    public ResponseEntity<CustomerDto.Response> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(customerService.getById(id));
    }

    // POST /api/customers
    @PostMapping
    public ResponseEntity<CustomerDto.Response> create(
            @Valid @RequestBody CustomerDto.CreateRequest req) {
        return ResponseEntity.ok(customerService.create(req));
    }

    // PUT /api/customers/{id}
    @PutMapping("/{id}")
    public ResponseEntity<CustomerDto.Response> update(
            @PathVariable Long id,
            @Valid @RequestBody CustomerDto.CreateRequest req) {
        return ResponseEntity.ok(customerService.update(id, req));
    }

    // DELETE /api/customers/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}