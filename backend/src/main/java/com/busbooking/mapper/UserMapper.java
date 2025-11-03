package com.busbooking.mapper;

import com.busbooking.dto.request.UpdateUserRequest;
import com.busbooking.dto.request.UserRequest;
import com.busbooking.dto.response.UserResponse;
import com.busbooking.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(UserRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());
        user.setRole(User.Role.valueOf(request.getRole()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        return user;
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getFullName(),
                user.getPhone(),
                user.getCreatedAt()
        );
    }

    public void updateEntity(User user, UserRequest request) {
        user.setUsername(request.getUsername());
        if (request.getPassword() != null) user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());
        user.setRole(User.Role.valueOf(request.getRole()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
    }

    // Overloaded method for UpdateUserRequest (password is optional)
    public void updateEntity(User user, UpdateUserRequest request) {
        user.setUsername(request.getUsername());
        // Only update password if provided and not null
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(request.getPassword());
        }
        user.setEmail(request.getEmail());
        user.setRole(User.Role.valueOf(request.getRole()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
    }
}
