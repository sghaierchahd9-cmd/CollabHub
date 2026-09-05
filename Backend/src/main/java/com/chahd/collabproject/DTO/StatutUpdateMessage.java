package com.chahd.collabproject.DTO;

import com.chahd.collabproject.Enum.StatutCollab;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
public class StatutUpdateMessage {
    private int utilisateurId;
    private StatutCollab statut;
    private OffsetDateTime finStatutPrevue;
}