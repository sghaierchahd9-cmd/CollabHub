package com.chahd.collabproject.entity;

import com.chahd.collabproject.Enum.TypeNotification;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "notification")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;


    @Enumerated(EnumType.STRING)
    @Column(name = "type_evenement", length = 100)
    private TypeNotification typeEvenement;

    @Column(name = "message", length = Integer.MAX_VALUE)
    private String message;


    @Column(name = "date_generation")
    private OffsetDateTime dateGeneration;

    @Column(name = "est_lue")
    private Boolean estLue;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private Utilisateur user;

    @Column(name = "date_suppression")
    private OffsetDateTime dateSuppression;

}