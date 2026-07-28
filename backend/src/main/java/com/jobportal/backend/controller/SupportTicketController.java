package com.jobportal.backend.controller;

import com.jobportal.backend.model.SupportTicket;
import com.jobportal.backend.repository.SupportTicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/support")
public class SupportTicketController {

    @Autowired
    private SupportTicketRepository supportTicketRepository;

    // Create a new support ticket
    @PostMapping("/tickets")
    public ResponseEntity<SupportTicket> createTicket(@RequestBody SupportTicket ticket) {
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(LocalDateTime.now());
        SupportTicket saved = supportTicketRepository.save(ticket);
        return ResponseEntity.ok(saved);
    }

    // Get tickets for a specific user
    @GetMapping("/tickets/user/{userId}")
    public ResponseEntity<List<SupportTicket>> getUserTickets(@PathVariable Long userId) {
        List<SupportTicket> tickets = supportTicketRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(tickets);
    }

    // Get all tickets (admin)
    @GetMapping("/tickets")
    public ResponseEntity<List<SupportTicket>> getAllTickets() {
        List<SupportTicket> tickets = supportTicketRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(tickets);
    }

    // Update ticket status (admin)
    @PutMapping("/tickets/{id}/status")
    public ResponseEntity<?> updateTicketStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<SupportTicket> opt = supportTicketRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        SupportTicket ticket = opt.get();
        ticket.setStatus(body.get("status"));
        supportTicketRepository.save(ticket);
        return ResponseEntity.ok(ticket);
    }

    // Admin reply to a ticket
    @PutMapping("/tickets/{id}/reply")
    public ResponseEntity<?> replyToTicket(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<SupportTicket> opt = supportTicketRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        SupportTicket ticket = opt.get();
        ticket.setAdminReply(body.get("adminReply"));
        if ("OPEN".equals(ticket.getStatus())) {
            ticket.setStatus("IN_PROGRESS");
        }
        supportTicketRepository.save(ticket);
        return ResponseEntity.ok(ticket);
    }
}
