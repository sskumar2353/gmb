package com.greenmiles.backend.auth;

import com.greenmiles.backend.auth.dto.AuthResponse;
import com.greenmiles.backend.auth.dto.AdminLoginRequest;
import com.greenmiles.backend.auth.dto.DriverLoginRequest;
import com.greenmiles.backend.auth.dto.LoginRequest;
import com.greenmiles.backend.auth.dto.RegisterRequest;
import com.greenmiles.backend.driver.Driver;
import com.greenmiles.backend.driver.DriverRepository;
import com.greenmiles.backend.security.JwtService;
import com.greenmiles.backend.user.AccountStatus;
import com.greenmiles.backend.user.User;
import com.greenmiles.backend.user.UserRepository;
import java.time.Instant;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final SessionRepository sessionRepository;
    private final JwtService jwtService;
    private final long jwtExpirationMinutes;
    private final String adminUsername;
    private final String adminPassword;

    public AuthService(
            UserRepository userRepository,
            DriverRepository driverRepository,
            SessionRepository sessionRepository,
            JwtService jwtService,
            @Value("${app.security.jwt.expiration-minutes}") long jwtExpirationMinutes,
            @Value("${app.security.admin.username}") String adminUsername,
            @Value("${app.security.admin.password}") String adminPassword) {
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
        this.sessionRepository = sessionRepository;
        this.jwtService = jwtService;
        this.jwtExpirationMinutes = jwtExpirationMinutes;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }
        if (userRepository.existsByPhone(request.phone())) {
            throw new IllegalArgumentException("Phone already registered");
        }

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPhone(request.phone().trim());
        user.setPasswordHash(request.password());
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setCreatedAt(Instant.now());
        User saved = userRepository.save(user);

        String token = jwtService.generateToken("USER:" + saved.getUserId(), "USER", saved.getEmail());
        saveSession(saved, token);
        return new AuthResponse(saved.getUserId(), saved.getFullName(), saved.getEmail(), token);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository
                .findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!request.password().equals(user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new IllegalArgumentException("Account is not active");
        }

        String token = jwtService.generateToken("USER:" + user.getUserId(), "USER", user.getEmail());
        saveSession(user, token);
        return new AuthResponse(user.getUserId(), user.getFullName(), user.getEmail(), token);
    }

    @Transactional(readOnly = true)
    public AuthResponse driverLogin(DriverLoginRequest request) {
        Driver driver = driverRepository
                .findByDriverIdAndPhone(request.driverId(), request.phone().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid driver credentials"));
        String token = jwtService.generateToken("DRIVER:" + driver.getDriverId(), "DRIVER", "driver-" + driver.getDriverId());
        return new AuthResponse(driver.getDriverId(), driver.getFullName(), "driver-" + driver.getDriverId(), token);
    }

    @Transactional(readOnly = true)
    public AuthResponse adminLogin(AdminLoginRequest request) {
        if (!adminUsername.equals(request.username()) || !adminPassword.equals(request.password())) {
            throw new IllegalArgumentException("Invalid admin credentials");
        }
        String token = jwtService.generateToken("ADMIN:" + adminUsername, "ADMIN", adminUsername);
        return new AuthResponse(0L, "System Admin", adminUsername, token);
    }

    private void saveSession(User user, String token) {
        Session session = new Session();
        session.setUser(user);
        session.setToken(token);
        session.setCreatedAt(Instant.now());
        session.setExpiryTime(LocalDateTime.now().plusMinutes(jwtExpirationMinutes));
        sessionRepository.save(session);
    }
}
