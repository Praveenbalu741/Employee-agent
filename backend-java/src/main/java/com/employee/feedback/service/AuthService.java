package com.employee.feedback.service;

import com.employee.feedback.config.JwtTokenProvider;
import com.employee.feedback.config.UserPrincipal;
import com.employee.feedback.dto.LoginResponse;
import com.employee.feedback.dto.RegisterRequest;
import com.employee.feedback.dto.TeamDto;
import com.employee.feedback.dto.UserDto;
import com.employee.feedback.model.Team;
import com.employee.feedback.model.User;
import com.employee.feedback.repository.TeamRepository;
import com.employee.feedback.repository.UserRepository;
import io.jsonwebtoken.Claims;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(
            UserRepository userRepository,
            TeamRepository teamRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        // Check if email already registered
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already registered.");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole().toLowerCase() : "employee");
        user.setActive(true);

        User savedUser = userRepository.save(user);

        String accessToken = tokenProvider.generateAccessToken(
                savedUser.getId(), savedUser.getEmail(), savedUser.getRole(), savedUser.getTeamId()
        );
        String refreshToken = tokenProvider.generateRefreshToken(savedUser.getId());

        savedUser.setRefreshToken(refreshToken);
        userRepository.save(savedUser);

        UserDto userDto = new UserDto(
                savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getRole(), savedUser.getTeamId()
        );

        return new LoginResponse(true, accessToken, userDto, refreshToken);
    }

    @Transactional
    public LoginResponse login(String email, String password) {
        User user = userRepository.findByEmailAndIsActive(email.toLowerCase(), true)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials."));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials.");
        }

        String accessToken = tokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole(), user.getTeamId()
        );
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        UserDto userDto = new UserDto(
                user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getTeamId()
        );

        return new LoginResponse(true, accessToken, userDto, refreshToken);
    }

    @Transactional
    public LoginResponse refresh(String refreshToken) {
        if (refreshToken == null || !tokenProvider.validateRefreshToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token.");
        }

        Claims claims = tokenProvider.getClaimsFromRefreshToken(refreshToken);
        Long userId = Long.parseLong(claims.getSubject());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (user.getRefreshToken() == null || !user.getRefreshToken().equals(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token.");
        }

        String newAccessToken = tokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole(), user.getTeamId()
        );
        String newRefreshToken = tokenProvider.generateRefreshToken(user.getId());

        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);

        return new LoginResponse(true, newAccessToken, null, newRefreshToken);
    }

    @Transactional
    public void logout(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setRefreshToken(null);
            userRepository.save(user);
        });
    }

    @Transactional(readOnly = true)
    public UserDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        Object teamRepresentation = null;
        if (user.getTeamId() != null) {
            Optional<Team> teamOpt = teamRepository.findById(user.getTeamId());
            if (teamOpt.isPresent()) {
                teamRepresentation = new TeamDto(teamOpt.get().getId(), teamOpt.get().getName());
            } else {
                teamRepresentation = user.getTeamId();
            }
        }

        return new UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                teamRepresentation
        );
    }
}
