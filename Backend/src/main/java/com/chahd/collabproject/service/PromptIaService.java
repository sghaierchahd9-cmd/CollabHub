package com.chahd.collabproject.service;

import com.chahd.collabproject.DTO.EvenementResume;
import com.chahd.collabproject.entity.Commentaire;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PromptIaService {
    private static final DateTimeFormatter FORMAT_DATE = DateTimeFormatter.ofPattern("dd/MM HH:mm");
    public String construirePromptSysteme(){
        return """
                Tu es un assistant qui résume l'activité récente d'un projet collaboratif pour un chef de projet pressé.
                Règles strictes:
                                - Réponds uniquement en français.
                                - Rédige un résumé de 4 à 6 phrases maximum, sous forme de paragraphe (pas de liste à puces).
                                - Mets en avant les décisions importantes, les blocages, et les échanges notables.
                                - Ne mentionne pas de dates précises où un role précis si il n'est pas mentionné explicitement , reste sur le fond (ce qui a été fait/discuté).
                                - N'invente jamais d'information qui n'est pas dans les données fournies.
                """;
    }



    public String construirePromptUtilisateur(String nomProjet , List<EvenementResume> evenements){
        if (evenements.isEmpty()) {
            return "Aucune activité récente n'a été enregistrée pour le projet \"" + nomProjet + "\".";
        }
        StringBuilder sb = new StringBuilder();
        sb.append("Voici les événements récents du projet  \"" + nomProjet + "\".\n");
        for (EvenementResume e: evenements){
            sb.append("- [").append(e.date().format(FORMAT_DATE)).append("] ")
                    .append(e.auteur()).append(" : ").append(e.description()).append("\n");    }
        sb.append("\nRésume cette activité.");
        return sb.toString();

    }
}
