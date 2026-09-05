package com.chahd.collabproject.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;



public record ResetPasswordRequest(
        @NotBlank String token,
        @NotBlank @Size(min = 8) String nouveauMotDePasse
) {}