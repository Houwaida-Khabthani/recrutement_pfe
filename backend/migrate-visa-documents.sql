-- Migration: Add visa documents table
-- This table will store visa-related documents uploaded by candidates

CREATE TABLE IF NOT EXISTS document_visa (
    id_document INT PRIMARY KEY AUTO_INCREMENT,
    id_user INT NOT NULL,
    id_demande_visa INT,
    type_document ENUM('PASSPORT', 'VISA', 'BIRTH_CERTIFICATE', 'POLICE_CERTIFICATE', 'MEDICAL_REPORT', 'COVER_LETTER', 'EMPLOYMENT_LETTER', 'OTHER') NOT NULL,
    nom_fichier VARCHAR(255) NOT NULL,
    chemin_fichier VARCHAR(500) NOT NULL,
    taille_fichier INT,
    date_upload DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    commentaire_admin TEXT,
    FOREIGN KEY (id_user) REFERENCES user(id_user) ON DELETE CASCADE,
    FOREIGN KEY (id_demande_visa) REFERENCES demande_visa(id_demande) ON DELETE SET NULL
);