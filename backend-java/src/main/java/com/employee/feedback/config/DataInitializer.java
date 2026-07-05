package com.employee.feedback.config;

import com.employee.feedback.model.Feedback;
import com.employee.feedback.model.Settings;
import com.employee.feedback.model.Team;
import com.employee.feedback.model.User;
import com.employee.feedback.repository.FeedbackRepository;
import com.employee.feedback.repository.SettingsRepository;
import com.employee.feedback.repository.TeamRepository;
import com.employee.feedback.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final FeedbackRepository feedbackRepository;
    private final SettingsRepository settingsRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            TeamRepository teamRepository,
            FeedbackRepository feedbackRepository,
            SettingsRepository settingsRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.feedbackRepository = feedbackRepository;
        this.settingsRepository = settingsRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return;
        }

        // 1. Create Manager User
        User manager = new User();
        manager.setName("Jane Manager");
        manager.setEmail("manager@company.com");
        manager.setPasswordHash(passwordEncoder.encode("password123"));
        manager.setRole("manager");
        manager.setActive(true);
        User savedManager = userRepository.save(manager);

        // 2. Create Team
        Team team = new Team("Engineering", savedManager.getId(), "Core Engineering and Development Team");
        Team savedTeam = teamRepository.save(team);

        // 3. Link Manager to Team
        savedManager.setTeamId(savedTeam.getId());
        userRepository.save(savedManager);

        // 4. Create Employee User
        User employee = new User();
        employee.setName("John Employee");
        employee.setEmail("employee@company.com");
        employee.setPasswordHash(passwordEncoder.encode("password123"));
        employee.setRole("employee");
        employee.setTeamId(savedTeam.getId());
        employee.setActive(true);
        User savedEmployee = userRepository.save(employee);

        // 5. Create Default Settings for Team
        Settings settings = new Settings(savedTeam.getId());
        settingsRepository.save(settings);

        // 6. Create Seed Feedback
        LocalDateTime now = LocalDateTime.now();

        // Feedback 1: Urgent burnout
        Feedback f1 = new Feedback();
        f1.setCategory("Workload");
        f1.setText("I've been working late hours past 9 PM to meet deadlines for three weeks. Feeling extremely exhausted and close to burnout.");
        f1.setMood("very_unhappy");
        f1.setAnonymous(true);
        f1.setTeamId(savedTeam.getId());
        f1.setSentimentScore(-0.75);
        f1.setThemes(List.of("workload", "burnout_crisis", "work_life_balance"));
        f1.setUrgent(true);
        f1.setUrgentReason("burnout_crisis");
        f1.setAiSummary("Employee reports chronic overwork past 9 PM, expressing high burnout risk and exhaustion.");
        f1.setAiProcessed(true);
        f1.setStatus("open");
        feedbackRepository.save(f1);
        // Set custom created time (hacks around JPA @PrePersist for seeding)
        updateCreatedTime(f1.getId(), now.minusDays(5));

        // Feedback 2: Positive culture
        Feedback f2 = new Feedback();
        f2.setCategory("Culture");
        f2.setText("I love working here! The team is incredibly supportive, and our weekly syncs are very collaborative.");
        f2.setMood("very_happy");
        f2.setAnonymous(false);
        f2.setEmployeeId(savedEmployee.getId());
        f2.setTeamId(savedTeam.getId());
        f2.setSentimentScore(0.85);
        f2.setThemes(List.of("culture", "team_dynamics"));
        f2.setUrgent(false);
        f2.setAiSummary("Employee shares highly positive feedback regarding team collaboration and supportive workplace culture.");
        f2.setAiProcessed(true);
        f2.setStatus("reviewed");
        feedbackRepository.save(f2);
        updateCreatedTime(f2.getId(), now.minusDays(3));

        // Feedback 3: Neutral compensation
        Feedback f3 = new Feedback();
        f3.setCategory("Compensation");
        f3.setText("With inflation rising, I hope the annual reviews will address market rate alignments for developers.");
        f3.setMood("neutral");
        f3.setAnonymous(true);
        f3.setTeamId(savedTeam.getId());
        f3.setSentimentScore(0.05);
        f3.setThemes(List.of("compensation"));
        f3.setUrgent(false);
        f3.setAiSummary("Feedback requesting review of developer compensation alignments due to inflation.");
        f3.setAiProcessed(true);
        f3.setStatus("open");
        feedbackRepository.save(f3);
        updateCreatedTime(f3.getId(), now.minusDays(2));

        // Feedback 4: Slightly negative workload
        Feedback f4 = new Feedback();
        f4.setCategory("Work-Life Balance");
        f4.setText("We need better planning. Requirements change mid-sprint, leading to unnecessary overtime.");
        f4.setMood("unhappy");
        f4.setAnonymous(true);
        f4.setTeamId(savedTeam.getId());
        f4.setSentimentScore(-0.35);
        f4.setThemes(List.of("workload", "work_life_balance"));
        f4.setUrgent(false);
        f4.setAiSummary("Employee expresses frustration over changing sprint requirements leading to overtime.");
        f4.setAiProcessed(true);
        f4.setStatus("open");
        feedbackRepository.save(f4);
        updateCreatedTime(f4.getId(), now.minusDays(1));

        System.out.println("🚀 Database initialized with seed data!");
    }

    private void updateCreatedTime(Long feedbackId, LocalDateTime time) {
        feedbackRepository.findById(feedbackId).ifPresent(f -> {
            f.setCreatedAt(time);
            feedbackRepository.save(f);
        });
    }
}
