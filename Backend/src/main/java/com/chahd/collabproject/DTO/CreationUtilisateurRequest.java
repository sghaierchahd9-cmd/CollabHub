package com.chahd.collabproject.DTO;

import com.chahd.collabproject.Enum.ModeTravail;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
public class CreationUtilisateurRequest {
    private String nom;
    private String prenom;
    private String email;

    private String role;
    @Enumerated(EnumType.STRING)
    private ModeTravail modeTravail;
    private List<Integer> equipeIds=new ArrayList<>();
}
