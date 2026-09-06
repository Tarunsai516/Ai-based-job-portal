package com.jobportal.backend.service;

import com.jobportal.backend.common.exception.ResourceNotFoundException;
import com.jobportal.backend.model.SupportTicket;
import com.jobportal.backend.repository.SupportTicketRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SupportTicketService {

    private static final Logger logger = LoggerFactory.getLogger(SupportTicketService.class);

    @Autowired
    private SupportTicketRepository supportTicketRepository;

    @Transactional
    public SupportTicket createTicket(SupportTicket ticket) {
        logger.info("Creating support ticket for user {}", ticket.getUserEmail());
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(LocalDateTime.now());
        return supportTicketRepository.save(ticket);
    }

    @Transactional(readOnly = true)
    public List<SupportTicket> getUserTickets(Long userId) {
        return supportTicketRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<SupportTicket> getAllTickets() {
        return supportTicketRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public SupportTicket updateTicketStatus(Long id, String status) {
        logger.info("Updating support ticket {} status to {}", id, status);
        SupportTicket ticket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Support ticket not found with ID: " + id));

        ticket.setStatus(status);
        return supportTicketRepository.save(ticket);
    }

    @Transactional
    public SupportTicket replyToTicket(Long id, String adminReply) {
        logger.info("Replying to support ticket {}", id);
        SupportTicket ticket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Support ticket not found with ID: " + id));

        ticket.setAdminReply(adminReply);
        if ("OPEN".equals(ticket.getStatus())) {
            ticket.setStatus("IN_PROGRESS");
        }
        return supportTicketRepository.save(ticket);
    }
}
