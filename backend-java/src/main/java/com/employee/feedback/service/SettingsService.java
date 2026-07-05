package com.employee.feedback.service;

import com.employee.feedback.dto.SettingsDto;
import com.employee.feedback.model.Settings;
import com.employee.feedback.repository.SettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {

    private final SettingsRepository settingsRepository;

    public SettingsService(SettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    @Transactional
    public SettingsDto getSettings(Long teamId) {
        if (teamId == null) {
            throw new IllegalArgumentException("Team ID is required to fetch settings.");
        }

        Settings settings = settingsRepository.findByTeamId(teamId)
                .orElseGet(() -> {
                    Settings defaultSettings = new Settings(teamId);
                    return settingsRepository.save(defaultSettings);
                });

        return mapToDto(settings);
    }

    @Transactional
    public SettingsDto updateSettings(Long teamId, SettingsDto updatesDto) {
        if (teamId == null) {
            throw new IllegalArgumentException("Team ID is required to update settings.");
        }

        Settings settings = settingsRepository.findByTeamId(teamId)
                .orElseGet(() -> new Settings(teamId));

        if (updatesDto.getFeedbackCategories() != null) {
            settings.setFeedbackCategories(updatesDto.getFeedbackCategories());
        }

        settings.setAnonymityDefault(updatesDto.isAnonymityDefault());

        if (updatesDto.getNotificationPreferences() != null) {
            SettingsDto.NotificationPreferencesDto prefs = updatesDto.getNotificationPreferences();
            settings.setUrgentEmail(prefs.isUrgentEmail());
            settings.setWeeklyDigest(prefs.isWeeklyDigest());
            settings.setWebhookUrl(prefs.getWebhookUrl());
        }

        if (updatesDto.getUrgentKeywords() != null) {
            settings.setUrgentKeywords(updatesDto.getUrgentKeywords());
        }

        Settings saved = settingsRepository.save(settings);
        return mapToDto(saved);
    }

    public SettingsDto mapToDto(Settings s) {
        SettingsDto dto = new SettingsDto();
        dto.setTeamId(s.getTeamId());
        dto.setFeedbackCategories(s.getFeedbackCategories());
        dto.setAnonymityDefault(s.isAnonymityDefault());
        dto.setUrgentKeywords(s.getUrgentKeywords());

        SettingsDto.NotificationPreferencesDto prefsDto = new SettingsDto.NotificationPreferencesDto(
                s.isUrgentEmail(),
                s.isWeeklyDigest(),
                s.getWebhookUrl()
        );
        dto.setNotificationPreferences(prefsDto);

        return dto;
    }
}
