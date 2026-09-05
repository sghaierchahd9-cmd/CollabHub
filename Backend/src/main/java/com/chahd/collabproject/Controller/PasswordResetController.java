package com.chahd.collabproject.Controller;

import com.chahd.collabproject.DTO.ForgetPasswordRequest;
import com.chahd.collabproject.DTO.ResetPasswordRequest;
import com.chahd.collabproject.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgetPasswordRequest request) {
        passwordResetService.demanderReset(request.email());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.reinitialiserMotDePasse(request.token(), request.nouveauMotDePasse());
        return ResponseEntity.ok().build();
    }
}
