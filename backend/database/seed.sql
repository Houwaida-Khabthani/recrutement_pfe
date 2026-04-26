-- Password is 'admin123' hashed with bcrypt
INSERT INTO user (nom, email, mot_de_passe, role, is_verified, date_inscription)
VALUES ('Super Admin', 'admin@recrutement.com', '$2b$10$Ep99kzX8e8j6g/sE5Oq5vuxC8iVp5.vN0F8S0iF6rX3X7zYy3xY.G', 'ADMIN', 1, NOW());

-- Example Company
INSERT INTO user (nom, email, mot_de_passe, role, nom_entreprise, description_entreprise, secteur, is_verified, date_inscription)
VALUES ('Tech Corp', 'contact@techcorp.com', '$2b$10$Ep99kzX8e8j6g/sE5Oq5vuxC8iVp5.vN0F8S0iF6rX3X7zYy3xY.G', 'ENTREPRISE', 'Tech Corp', 'Innovative tech company', 'IT', 1, NOW());

-- Get the last inserted ID for the company user and link it
INSERT INTO company (nom, description, email, secteur, id_user)
SELECT nom_entreprise, description_entreprise, email, secteur, id_user FROM user WHERE email = 'contact@techcorp.com';

-- Example Job
INSERT INTO offre (titre, type_contrat, localisation, description, salaire, experience, id_entreprise, date_pub, statut)
SELECT 'Fullstack Developer', 'CDI', 'Paris', 'Experienced Fullstack developer with Node.js and React skills.', 50000.00, '3 years', id_company, NOW(), 'OUVERT'
FROM company WHERE email = 'contact@techcorp.com';