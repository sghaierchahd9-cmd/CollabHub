package com.chahd.collabproject.entity;


import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@MappedSuperclass
@Data
@NoArgsConstructor
public class Auditable {
    @Column(name = "date_creation", nullable = false, updatable = false)
    private OffsetDateTime date_creation;

    @Column(name = "date_suppression")
    private OffsetDateTime date_suppression;

    @PrePersist
    protected void onCreate() {
        this.date_creation = OffsetDateTime.now();
    }
}
