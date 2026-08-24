package com.salon.booking.service;

import com.salon.booking.dto.AuthResponse;
import com.salon.booking.dto.LoginRequest;
import com.salon.booking.dto.RegisterRequest;
import com.salon.booking.model.Role;
import com.salon.booking.model.User;
import com.salon.booking.repository.UserRepository;
import com.salon.booking.security.JwtUtils;
import com.salon.booking.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    public AuthResponse registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new IllegalArgumentException("Email is already registered!");
        }

        Role userRole = registerRequest.getRole() != null ? registerRequest.getRole() : Role.CUSTOMER;

        User user = new User(
                registerRequest.getName(),
                registerRequest.getEmail(),
                encoder.encode(registerRequest.getPassword()),
                userRole
        );

        User savedUser = userRepository.save(user);

        // Auto login after registration to return JWT
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(registerRequest.getEmail(), registerRequest.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        return new AuthResponse(
                jwt,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }

    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return new AuthResponse(
                jwt,
                userDetails.getId(),
                userDetails.getName(),
                userDetails.getUsername(), // email
                userDetails.getRole()
        );
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new IllegalStateException("No authenticated user found in security context");
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Current user not found in database"));
    }
}
