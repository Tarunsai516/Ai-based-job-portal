package com.jobportal.backend.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static CustomUserDetails getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            return (CustomUserDetails) authentication.getPrincipal();
        }
        return null;
    }

    public static boolean isCurrentUserAdmin() {
        CustomUserDetails userDetails = getCurrentUserDetails();
        return userDetails != null && "ADMIN".equalsIgnoreCase(userDetails.getRole());
    }
}
