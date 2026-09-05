package com.chahd.collabproject.DTO;

import com.chahd.collabproject.Enum.ModeTravail;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

@Data
public class UpdateProfileDTO {
    private String nom;
    private String prenom;
    @Enumerated(EnumType.STRING)
    private ModeTravail modeTravail;
}