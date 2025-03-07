package com.example.demo.services;

import com.example.demo.dtos.UserDto;
import com.example.demo.exceptions.EmailAlreadyExistsException;
import com.example.demo.exceptions.UsernameAlreadyExistsException;
import com.example.demo.models.User;
import com.example.demo.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.naming.AuthenticationException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(UserDto userDto) throws UsernameAlreadyExistsException, EmailAlreadyExistsException {
        // Check if the user already exists
        if (userRepository.existsByUsername(userDto.getUsername())) {
            throw new UsernameAlreadyExistsException("Username already exists");
        }

        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        // Create a new User entity from the DTO
        User newUser = new User();
        newUser.setUsername(userDto.getUsername());
        newUser.setEmail(userDto.getEmail());
        newUser.setPassword(passwordEncoder.encode(userDto.getPassword()));

        // Save the new user entity
        return userRepository.save(newUser);
    }

    public User authenticateUser(String username, String password) throws AuthenticationException {
        // Check that the user's username and password exist
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthenticationException("Username doesn't exist"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new AuthenticationException("Password doesn't match");
        }

        // Return user
        return user;
    }
}
