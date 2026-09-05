package com.chahd.collabproject.DTO;

import com.chahd.collabproject.Enum.TypeNotification;
import com.chahd.collabproject.entity.Notification;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
@Getter
@Setter
public class NotificationDTO {
    private String message;
    @Enumerated(EnumType.STRING)
    private TypeNotification typeEvenement;
    private boolean estLue;
    private int id;
    private OffsetDateTime dateGeneration;
    private OffsetDateTime dateSuppression;

    public static NotificationDTO fromNotification(Notification notification) {
        NotificationDTO notificationDTO = new NotificationDTO();
        notificationDTO.message = notification.getMessage();
        notificationDTO.typeEvenement = notification.getTypeEvenement();
        notificationDTO.estLue = notification.getEstLue();
        notificationDTO.id = notification.getId();
        notificationDTO.dateGeneration=notification.getDateGeneration();
        notificationDTO.dateSuppression=notification.getDateSuppression();
        return notificationDTO;
    }



}
