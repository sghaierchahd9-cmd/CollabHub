package com.chahd.collabproject.DTO;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CommentaireRequestDTO {
    private String contenu;
    private Integer parentId;       // null si commentaire racine
    private List<Integer> mentionIds;
}