package com.jobportal.backend.controller;

import com.jobportal.backend.model.SupportTicket;
import com.jobportal.backend.service.SupportTicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support")
public class SupportTicketController {

    @Autowired
    private SupportTicketService supportTicketService;

    // Create a new support ticket
    @PostMapping("/tickets")
    public ResponseEntity<SupportTicket> createTicket(@RequestBody SupportTicket ticket) {
        return ResponseEntity.ok(supportTicketService.createTicket(ticket));
    }

    // Get tickets for a specific user
    @GetMapping("/tickets/user/{userId}")
    public ResponseEntity<List<SupportTicket>> getUserTickets(@PathVariable Long userId) {
        return ResponseEntity.ok(supportTicketService.getUserTickets(userId));
    }

    // Get all tickets (admin)
    @GetMapping("/tickets")
    public ResponseEntity<List<SupportTicket>> getAllTickets() {
        return ResponseEntity.ok(supportTicketService.getAllTickets());
    }

    // Update ticket status (admin)
    @PutMapping("/tickets/{id}/status")
    public ResponseEntity<SupportTicket> updateTicketStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(supportTicketService.updateTicketStatus(id, body.get("status")));
    }

    // Admin reply to a ticket
    @PutMapping("/tickets/{id}/reply")
    public ResponseEntity<SupportTicket> replyToTicket(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(supportTicketService.replyToTicket(id, body.get("adminReply")));
    }
}
