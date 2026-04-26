CREATE TABLE user (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'CANDIDAT', 'ENTREPRISE') NOT NULL,
    telephone VARCHAR(20),
    pays VARCHAR(100),
    adresse VARCHAR(255),
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
    civilite ENUM('Mr', 'Mme', 'Mlle'),
    date_naissance DATE,
    cv VARCHAR(255),
    niveau_etude VARCHAR(100),
    specialite VARCHAR(150),
    experience VARCHAR(150),
    nom_entreprise VARCHAR(150),
    description_entreprise TEXT,
    identifiant_entreprise VARCHAR(100),
    logo VARCHAR(255),
    secteur VARCHAR(100),
    site_web VARCHAR(255)
);
CREATE TABLE company (
    id_company INT AUTO_INCREMENT PRIMARY KEY,
    secteur VARCHAR(100),
    pays VARCHAR(100),
    site_web VARCHAR(255),
    type VARCHAR(50)
);
CREATE TABLE offre (
    id_offre INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(150),
    type_contrat VARCHAR(100),
    localisation VARCHAR(100),
    description TEXT,
    salaire DECIMAL(10,2),
    experience VARCHAR(100),
    date_pub DATE,
    statut VARCHAR(50),
    id_entreprise INT NOT NULL,
    FOREIGN KEY (id_entreprise) REFERENCES company(id_company)
        ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE candidature (
    id_candidature INT AUTO_INCREMENT PRIMARY KEY,
    cv VARCHAR(255),
    date_postule DATE,
    statut VARCHAR(50),
    lettre_motivation VARCHAR(255),
    date_reponse DATE,
    id_user INT NOT NULL,
    id_offre INT NOT NULL,
    FOREIGN KEY (id_user) REFERENCES user(id_user)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_offre) REFERENCES offre(id_offre)
        ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE certification (
    id_certif INT AUTO_INCREMENT PRIMARY KEY,
    date_obtient DATE,
    university VARCHAR(150),
    competence VARCHAR(150),
    id_user INT NOT NULL,
    FOREIGN KEY (id_user) REFERENCES user(id_user)
        ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE matching (
    id_matching INT AUTO_INCREMENT PRIMARY KEY,
    score INT,
    note INT,
    date DATE,
    id_candidature INT,
    id_offre INT,
    FOREIGN KEY (id_candidature) REFERENCES candidature(id_candidature)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_offre) REFERENCES offre(id_offre)
        ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE notification (
    id_notif INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(100),
    date DATE,
    lu TINYINT(1) DEFAULT 0,
    id_user INT NOT NULL,
    FOREIGN KEY (id_user) REFERENCES user(id_user)
        ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE fichier (
    id_fichier INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(150),
    date_creation DATE,
    type VARCHAR(50),
    url VARCHAR(255),
    id_entreprise INT,
    FOREIGN KEY (id_entreprise) REFERENCES company(id_company)
        ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE demande_visa (
    id_demande INT AUTO_INCREMENT PRIMARY KEY,
    date_demande DATE,
    statut VARCHAR(50),
    type_visa VARCHAR(100),
    date_debut DATE,
    date_fin DATE,
    id_user INT NOT NULL,
    FOREIGN KEY (id_user) REFERENCES user(id_user)
        ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE visa (
    id_visa INT AUTO_INCREMENT PRIMARY KEY,
    pays VARCHAR(100),
    date_creation DATE,
    type VARCHAR(100),
    statut VARCHAR(50),
    date_validation DATE,
    id_demande INT NOT NULL,
    FOREIGN KEY (id_demande) REFERENCES demande_visa(id_demande)
        ON DELETE CASCADE ON UPDATE CASCADE
);
ALTER TABLE user
ADD bio TEXT AFTER specialite,
ADD avatar VARCHAR(255) AFTER bio,
ADD linkedin VARCHAR(255) AFTER avatar,
ADD github VARCHAR(255) AFTER linkedin,
ADD portfolio VARCHAR(255) AFTER github,
ADD is_verified TINYINT(1) DEFAULT 0 AFTER portfolio;

ALTER TABLE company
ADD nom VARCHAR(150) AFTER id_company,
ADD description TEXT AFTER nom,
ADD logo VARCHAR(255) AFTER description,
ADD email VARCHAR(150) AFTER logo,
ADD telephone VARCHAR(20) AFTER email,
ADD id_user INT AFTER telephone;

ALTER TABLE offre
ADD nombre_vues INT DEFAULT 0 AFTER statut,
ADD date_expiration DATE AFTER nombre_vues;

ALTER TABLE candidature
ADD entretien_date DATE AFTER date_reponse,
ADD entretien_lieu VARCHAR(150) AFTER entretien_date,
ADD note_recruteur INT AFTER entretien_lieu;

ALTER TABLE candidature
ADD offer_salary DECIMAL(10,2) NULL AFTER note_recruteur,
ADD offer_currency VARCHAR(10) NULL AFTER offer_salary,
ADD offer_contract_type VARCHAR(100) NULL AFTER offer_currency,
ADD offer_start_date DATE NULL AFTER offer_contract_type,
ADD offer_message TEXT NULL AFTER offer_start_date,
ADD offer_status VARCHAR(20) NULL AFTER offer_message,
ADD offer_sent_at DATETIME NULL AFTER offer_status,
ADD offer_responded_at DATETIME NULL AFTER offer_sent_at;

ALTER TABLE certification
ADD description TEXT AFTER competence;

ALTER TABLE notification
ADD message TEXT AFTER type;

ALTER TABLE demande_visa
ADD commentaire_admin TEXT AFTER statut;

ALTER TABLE user
ADD projets TEXT AFTER portfolio,
ADD langues VARCHAR(150) AFTER projets,
ADD certification TEXT AFTER langues,
ADD competences TEXT AFTER certification;