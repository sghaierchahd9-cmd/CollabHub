package com.chahd.collabproject.DTO;


import com.chahd.collabproject.entity.Piecejointe;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class PieceJointeDTO {
    private Integer id;
    private String nomFichier;
    private OffsetDateTime dateUpload;
    private Integer tacheId;
    private Integer userId;

    public static PieceJointeDTO fromPiecejointe(Piecejointe p) {
        return PieceJointeDTO.builder()
                .id(p.getId())
                .nomFichier(p.getNomFichier())
                .dateUpload(p.getDateUpload())
                .tacheId(p.getTache().getId())
                .userId(p.getUser().getId())
                .build();
    }
}

