package com.mmt.eventwedding.controller;

import com.mmt.eventwedding.dto.LeadRequest;
import com.mmt.eventwedding.dto.LeadResponse;
import com.mmt.eventwedding.service.LeadService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @PostMapping("/leads")
    public ResponseEntity<LeadResponse> create(@Valid @RequestBody LeadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.createLead(request));
    }

    @GetMapping("/admin/leads")
    public List<LeadResponse> list() {
        return leadService.listLeads();
    }
}
