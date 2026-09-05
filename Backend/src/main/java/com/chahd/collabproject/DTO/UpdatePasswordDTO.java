package com.chahd.collabproject.DTO;

import org.springframework.security.crypto.password.PasswordEncoder;

public class UpdatePasswordDTO {
    private String currentPassword;
    private String newPassword;

    public String getCurrentPassword() { return currentPassword; }
    public String getNewPassword() { return newPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}