-- ============ PROJET ============
-- Remplace chef_id par les vrais IDs de tes utilisateurs créés via Postman
INSERT INTO projet (id, nom, description, objectifs, date_debut, date_fin_prevue, niveau_priorite, statut, chef_id, date_creation)
VALUES
    (1, 'Migration API v2', 'Refonte des endpoints REST', 'Améliorer la performance', '2026-06-01', '2026-09-30', 'HAUTE', 'EN_COURS', 22, now()),
    (2, 'Module Notifications', 'Intégration WebSocket temps réel', 'Notifications instantanées', '2026-07-01', '2026-10-15', 'MOYENNE', 'TERMINE', 22, now())

ON CONFLICT (id) DO NOTHING;

-- ============ TACHE ============
INSERT INTO tache (id, titre, description, priorite, date_debut, echeance, statut, taux_avancement, projet_id, date_creation)
VALUES
    (1, 'Créer endpoint GET /projects', 'Endpoint REST pour lister les projets', 'HAUTE', '2026-06-05', '2026-06-10', 'TERMINEE', 100.0, 1, now()),
    (2, 'Ajouter validation DTO', 'Validation via Bean Validation', 'MOYENNE', '2026-06-11', '2026-06-20', 'EN_COURS', 60.0, 1, now()),
    (3, 'Configurer STOMP broker', 'Mise en place du broker WebSocket', 'HAUTE', '2026-07-05', '2026-07-15', 'BLOQUEE', 20.0, 2, now()),
    (4, 'Tester reconnection WebSocket', 'Tests de résilience réseau', 'MOYENNE', '2026-07-16', '2026-07-25', 'BLOQUEE', 0.0, 2, now()),
    (5, 'Corriger bug pagination', 'Fix pagination liste projets', 'HAUTE', '2026-06-21', '2026-06-25', 'EN_COURS', 45.0, 1, now())
ON CONFLICT (id) DO NOTHING;

-- ============ MEMBRE_PROJET (ManyToMany Utilisateur <-> Projet) ============
-- Remplace les membre_id par les vrais IDs de tes users
INSERT INTO membre_projet (membre_id, projet_id)
VALUES
    (23, 1),
    (24, 2),
    (23, 2),
    (24, 1)
ON CONFLICT DO NOTHING;

-- ============ AFFECTATION_TACHE (ManyToMany Utilisateur <-> Tache) ============
INSERT INTO affectation_tache (collab_id, tache_id)
VALUES
    (23, 1),
    (23, 2),
    (24, 3),
    (24, 4),
    (23, 5)

ON CONFLICT DO NOTHING;