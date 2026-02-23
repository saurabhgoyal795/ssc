package com.sscexam.service.auth;

import com.sscexam.exception.BadRequestException;
import com.sscexam.exception.ResourceNotFoundException;
import com.sscexam.exception.UnauthorizedException;
import com.sscexam.model.dto.*;
import com.sscexam.model.entity.RefreshToken;
import com.sscexam.model.entity.User;
import com.sscexam.model.enums.UserRole;
import com.sscexam.repository.RefreshTokenRepository;
import com.sscexam.repository.UserRepository;
import com.sscexam.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address already in use");
        }

        // Create new user
        User user = User.builder()
                .uuid(UUID.randomUUID())
                .email(request.getEmail())
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.STUDENT)
                .isEmailVerified(false)
                .isActive(true)
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        // Generate tokens
        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Get user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        // Update last login
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // Generate tokens
        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = createRefreshToken(user);

        log.info("User logged in: {}", user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        RefreshToken refreshToken = refreshTokenRepository.findByToken(requestRefreshToken)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (refreshToken.getIsRevoked()) {
            throw new UnauthorizedException("Refresh token has been revoked");
        }

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new UnauthorizedException("Refresh token has expired");
        }

        User user = refreshToken.getUser();

        // Generate new tokens
        String newAccessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String newRefreshToken = createRefreshToken(user);

        // Delete old refresh token
        refreshTokenRepository.delete(refreshToken);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(token -> {
                    token.setIsRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }

    private String createRefreshToken(User user) {
        String token = tokenProvider.generateRefreshToken(user.getId());

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .isRevoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);

        return token;
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .uuid(user.getUuid())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .isEmailVerified(user.getIsEmailVerified())
                .isActive(user.getIsActive())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
