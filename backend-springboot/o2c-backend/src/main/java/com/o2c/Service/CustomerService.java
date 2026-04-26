package com.o2c.Service;

import com.o2c.dto.CustomerDto;
import com.o2c.entity.Customer;
import com.o2c.Repoitory.CustomerRepository;
import com.o2c.Repoitory.OrderRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final OrderRepository    orderRepository;

    public List<CustomerDto.Response> getAllCustomers() {
        return customerRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CustomerDto.Response getById(@NonNull Long id) {
        Customer c = customerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found."));
        return toResponse(c);
    }

    public CustomerDto.Response create(CustomerDto.CreateRequest req) {
        Customer c = Customer.builder()
                .name(req.getName())
                .email(req.getEmail())
                .mobile(req.getMobile())
                .city(req.getCity())
                .address(req.getAddress())
                .status(Customer.Status.ACTIVE)
                .build();
        return toResponse(customerRepository.save(c));
    }

    public CustomerDto.Response update(Long id,
                                        CustomerDto.CreateRequest req) {
        Customer c = customerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found."));
        c.setName(req.getName());
        c.setEmail(req.getEmail());
        c.setMobile(req.getMobile());
        c.setCity(req.getCity());
        c.setAddress(req.getAddress());
        return toResponse(customerRepository.save(c));
    }

    public void delete(Long id) {
        customerRepository.deleteById(id);
    }

    // ── Mapper ───────────────────────────────────────────────
    private CustomerDto.Response toResponse(Customer c) {
        CustomerDto.Response r = new CustomerDto.Response();
        r.setId(c.getId());
        r.setName(c.getName());
        r.setEmail(c.getEmail());
        r.setMobile(c.getMobile());
        r.setCity(c.getCity());
        r.setAddress(c.getAddress());
        r.setStatus(c.getStatus().name());
        r.setTotalOrders(
                orderRepository.findByCustomerId(c.getId()).size());
        r.setTotalSpent("$0.00");
        r.setCreatedAt(c.getCreatedAt() != null
                ? c.getCreatedAt().toString() : "");
        return r;
    }
}