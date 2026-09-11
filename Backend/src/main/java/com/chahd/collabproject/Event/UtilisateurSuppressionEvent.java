package com.chahd.collabproject.Event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class UtilisateurSuppressionEvent extends ApplicationEvent {
    private final int utilisateurId;

    public UtilisateurSuppressionEvent(Object source, int utilisateurId) {
        super(source);
        this.utilisateurId = utilisateurId;
    }

}
