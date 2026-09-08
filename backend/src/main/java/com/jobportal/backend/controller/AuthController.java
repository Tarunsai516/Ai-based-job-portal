package com.jobportal.backend.controller;

import com.jobportal.backend.dto.JwtResponse;
import com.jobportal.backend.dto.UserDto;
import com.jobportal.backend.model.User;
import com.jobportal.backend.repository.UserRepository;
import com.jobportal.backend.security.CustomUserDetails;
import com.jobportal.backend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Value("${app.jwt.expiration-ms:86400000}")
    private Long jwtExpirationMs;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Email already exists"));
        }

        String rawPassword = user.getPassword();
        user.setPassword(encoder.encode(rawPassword));
        User savedUser = userRepository.save(user);

        String jwt = jwtUtils.generateTokenFromEmail(
                savedUser.getEmail(),
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getRole()
        );

        UserDto userDto = UserDto.fromEntity(savedUser);

        JwtResponse jwtResponse = JwtResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .type("Bearer")
                .expiresIn(jwtExpirationMs)
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .user(userDto)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(jwtResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        String requestedRole = credentials.get("role");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
        }

        User user = userOpt.get();
        if (requestedRole != null && !requestedRole.isEmpty() && !user.getRole().equalsIgnoreCase(requestedRole)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Role mismatch"));
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UserDto userDto = UserDto.builder()
                .id(userDetails.getId())
                .name(userDetails.getName())
                .email(userDetails.getEmail())
                .role(userDetails.getRole())
                .build();

        JwtResponse jwtResponse = JwtResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .type("Bearer")
                .expiresIn(jwtExpirationMs)
                .id(userDetails.getId())
                .name(userDetails.getName())
                .email(userDetails.getEmail())
                .role(userDetails.getRole())
                .user(userDto)
                .build();

        return ResponseEntity.ok(jwtResponse);
    }
}
