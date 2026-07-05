package com.employee.feedback.controller;

import com.employee.feedback.config.UserPrincipal;
import com.employee.feedback.dto.SettingsDto;
import com.employee.feedback.service.SettingsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@PreAuthorize("hasRole('ROLE_MANAGER')")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public ResponseEntity<?> getSettings(
            @RequestParam(required = false) Long teamId,
            @AuthenticationPrincipal UserPrincipal principal) {
        
        Long resolvedTeamId = teamId;
        if (principal != null && "manager".equalsIgnoreCase(principal.getRole())) {
            resolvedTeamId = principal.getTeamId();
        }

        if (resolvedTeamId == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Team ID required.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        SettingsDto settings = settingsService.getSettings(resolvedTeamId);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", settings);
        return ResponseEntity.ok(body);
    }

    @PatchMapping
    public ResponseEntity<?> updateSettings(
            @RequestBody SettingsDto updates,
            @AuthenticationPrincipal UserPrincipal principal) {
        
        Long resolvedTeamId = updates.getTeamId();
        if (resolvedTeamId == null && principal != null) {
            resolvedTeamId = principal.getTeamId();
        }

        if (resolvedTeamId == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Team ID required.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        SettingsDto settings = settingsService.updateSettings(resolvedTeamId, updates);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", settings);
        return ResponseEntity.ok(body);
    }
}
