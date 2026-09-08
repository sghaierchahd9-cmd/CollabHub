package com.chahd.collabproject.Controller;

import com.chahd.collabproject.DTO.NotificationDTO;
import com.chahd.collabproject.entity.Notification;
import com.chahd.collabproject.entity.Utilisateur;
import com.chahd.collabproject.repository.NotificationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping
    public List<NotificationDTO> getNotifications(@AuthenticationPrincipal Utilisateur user) {
        return notificationRepository
                .findByUserAndDateSuppressionIsNullOrderByDateGenerationDesc(user)
                .stream()
                .map(NotificationDTO::fromNotification)
                .toList();
    }

    @PatchMapping("/{id}/lue")
    public NotificationDTO marquerCommeLue(@PathVariable Integer id, @AuthenticationPrincipal Utilisateur user) {
        Notification notification = notificationRepository.findByIdAndDateSuppressionIsNull(id)
                .orElseThrow(() -> new EntityNotFoundException("Notification introuvable"));

        if (notification.getUser().getId() != user.getId()) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Vous ne pouvez pas modifier la notification d'un autre utilisateur");
        }

        notification.setEstLue(true);
        Notification saved = notificationRepository.save(notification);
        return NotificationDTO.fromNotification(saved);
    }
}