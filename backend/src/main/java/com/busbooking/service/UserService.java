package com.busbooking.service;

import com.busbooking.dto.request.UpdateUserRequest;
import com.busbooking.dto.request.UserRequest;
import com.busbooking.dto.response.UserResponse;
import com.busbooking.exception.ResourceNotFoundException;
import com.busbooking.mapper.UserMapper;
import com.busbooking.model.User;
import com.busbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Integer id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return userMapper.toResponse(u);
    }

    public UserResponse createUser(UserRequest request) {
        User u = userMapper.toEntity(request);
        User saved = userRepository.save(u);
        return userMapper.toResponse(saved);
    }

    public UserResponse updateUser(Integer id, UpdateUserRequest request) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        // Chỉ cho phép cập nhật email, phone, fullName
        u.setEmail(request.getEmail());
        u.setPhone(request.getPhone());
        u.setFullName(request.getFullName());
        
        User updated = userRepository.save(u);
        return userMapper.toResponse(updated);
    }

    public UserResponse toggleUserStatus(Integer id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        u.setIsActive(!u.getIsActive());
        User updated = userRepository.save(u);
        return userMapper.toResponse(updated);
    }

    public void deleteUser(Integer id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        userRepository.delete(u);
    }

    public UserResponse getUserByUsername(String username) {
        User u = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return userMapper.toResponse(u);
    }
}
