package com.spaservice.service;

import com.spaservice.dto.AuthDtos.*;
import com.spaservice.entity.Agent;
import com.spaservice.entity.BranchUnlock;
import com.spaservice.entity.Role;
import com.spaservice.entity.User;
import com.spaservice.exception.AppException;
import com.spaservice.repository.AgentRepository;
import com.spaservice.repository.BranchUnlockRepository;
import com.spaservice.repository.UserRepository;
import com.spaservice.security.JwtTokenService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final AgentRepository agentRepository;
    private final BranchUnlockRepository branchUnlockRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    public AuthService(UserRepository userRepository, AgentRepository agentRepository, BranchUnlockRepository branchUnlockRepository, PasswordEncoder passwordEncoder, JwtTokenService jwtTokenService) {
        this.userRepository = userRepository;
        this.agentRepository = agentRepository;
        this.branchUnlockRepository = branchUnlockRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email is already registered: " + request.getEmail());
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase().trim())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.CLIENT)
                .isVerified(true)
                .isActive(true)
                .build();

        user = userRepository.save(user);

        return buildAuthResponse(user, null);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new AppException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AppException("Invalid email or password");
        }

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new AppException("Account is deactivated. Please contact support.");
        }

        UUID assignedBranchId = null;
        String assignedBranchName = null;
        if (user.getRole() == Role.AGENT) {
            Optional<Agent> agentOpt = agentRepository.findByUserId(user.getId());
            if (agentOpt.isPresent()) {
                assignedBranchId = agentOpt.get().getAssignedBranch().getId();
                assignedBranchName = agentOpt.get().getAssignedBranch().getName();
            }
        }

        return buildAuthResponse(user, assignedBranchId, assignedBranchName);
    }

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenService.validateToken(refreshToken)) {
            throw new AppException("Invalid or expired refresh token");
        }

        String email = jwtTokenService.extractEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found"));

        UUID assignedBranchId = null;
        String assignedBranchName = null;
        if (user.getRole() == Role.AGENT) {
            Optional<Agent> agentOpt = agentRepository.findByUserId(user.getId());
            if (agentOpt.isPresent()) {
                assignedBranchId = agentOpt.get().getAssignedBranch().getId();
                assignedBranchName = agentOpt.get().getAssignedBranch().getName();
            }
        }

        return buildAuthResponse(user, assignedBranchId, assignedBranchName);
    }

    public AuthResponse buildAuthResponse(User user, UUID assignedBranchId) {
        return buildAuthResponse(user, assignedBranchId, null);
    }

    public AuthResponse buildAuthResponse(User user, UUID assignedBranchId, String assignedBranchName) {
        List<BranchUnlock> activeUnlocks = branchUnlockRepository.findAllActiveClientUnlocks(user.getId(), ZonedDateTime.now());

        List<BranchUnlockDto> unlockDtos = activeUnlocks.stream()
                .map(u -> BranchUnlockDto.builder()
                        .branchId(u.getBranch().getId())
                        .branchName(u.getBranch().getName())
                        .expiresAt(u.getExpiresAt())
                        .build())
                .collect(Collectors.toList());

        String accessToken = jwtTokenService.generateAccessToken(user, assignedBranchId, unlockDtos);
        String refreshToken = jwtTokenService.generateRefreshToken(user);

        UserDto userDto = UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .assignedBranchId(assignedBranchId)
                .assignedBranchName(assignedBranchName)
                .build();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400)
                .user(userDto)
                .activeUnlocks(unlockDtos)
                .build();
    }
}
