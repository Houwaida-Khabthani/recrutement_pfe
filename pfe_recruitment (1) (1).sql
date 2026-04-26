-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 06, 2026 at 03:29 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pfe_recruitment`
--

-- --------------------------------------------------------

--
-- Table structure for table `candidature`
--

CREATE TABLE `candidature` (
  `id_candidature` int(11) NOT NULL,
  `cv` varchar(255) DEFAULT NULL,
  `date_postule` date DEFAULT NULL,
  `statut` varchar(50) DEFAULT NULL,
  `lettre_motivation` varchar(255) DEFAULT NULL,
  `date_reponse` date DEFAULT NULL,
  `entretien_date` date DEFAULT NULL,
  `entretien_lieu` varchar(150) DEFAULT NULL,
  `note_recruteur` int(11) DEFAULT NULL,
  `offer_salary` decimal(10,2) DEFAULT NULL,
  `offer_currency` varchar(10) DEFAULT NULL,
  `offer_contract_type` varchar(100) DEFAULT NULL,
  `offer_start_date` date DEFAULT NULL,
  `offer_message` text DEFAULT NULL,
  `offer_status` varchar(20) DEFAULT NULL,
  `offer_sent_at` datetime DEFAULT NULL,
  `offer_responded_at` datetime DEFAULT NULL,
  `id_user` int(11) NOT NULL,
  `id_offre` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `candidature`
--

INSERT INTO `candidature` (`id_candidature`, `cv`, `date_postule`, `statut`, `lettre_motivation`, `date_reponse`, `entretien_date`, `entretien_lieu`, `note_recruteur`, `offer_salary`, `offer_currency`, `offer_contract_type`, `offer_start_date`, `offer_message`, `offer_status`, `offer_sent_at`, `offer_responded_at`, `id_user`, `id_offre`) VALUES
(5, 'cv_candidate_17.pdf', '2026-04-05', NULL, NULL, '2026-04-05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 17, 14),
(7, 'cv_candidate_19.pdf', '2026-04-05', 'ACCEPTED', NULL, '2026-04-05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 19, 13),
(9, 'cv_candidate_21.pdf', '2026-04-05', NULL, NULL, '2026-04-05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 21, 15),
(10, '1775425793876-ayoub_cv.pdf', '2026-04-05', 'INTERVIEW', 'hi', '2026-04-05', '2026-06-12', 'Online Meet (Google Meet)', 9, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 10, 17),
(13, '1775427101173-ayoub_cv.pdf', '2026-04-05', 'ACCEPTED', 'saleeemo alikom', '2026-04-05', NULL, NULL, 9, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 10, 15),
(14, '1775471660305-CV_Professionnel_FranÃ§ais_Moderne_Simple_Minimaliste_Noir_et_Blanc_(2).pdf', '2026-04-06', 'ACCEPTED', 'testiny ', '2026-04-06', '2026-04-16', 'rtfyguio', 0, 800.00, 'TND', 'cdi', '2026-04-14', 'welcome hom', 'REJECTED', '2026-04-06 12:47:24', '2026-04-06 12:47:51', 10, 13),
(15, '1775478227741-waelriahi_cv_eng(1).pdf', '2026-04-06', 'INTERVIEW', 'Hello,\r\n\r\nI’m applying for the Senior Full‑Stack Developer (React + Node) position. I have 4+ years of experience building production web applications with React/TypeScript on the frontend and Node.js/Express on the backend, with strong SQL skills and Doc', '2026-04-06', '2026-04-16', 'https://www.linkedin.com/in/wael-riahi-', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 32, 20),
(16, '1775481025544-wael_c.v_ang.docx', '2026-04-06', 'ACCEPTED', 'I am an Information Systems Development student at the Higher Institute of Technological Studies of Kélibia with hands-on experience in IT, web development, and database management. My internships have enhanced my skills in Angular, UiPath, and Robotic Pr', '2026-04-06', '2026-04-08', 'https://meet.google.com/yta-fbbx-gqw', 0, 8000.00, 'TND', 'Full time ', '2026-04-13', 'swdrtfuyigu_çià', 'ACCEPTED', '2026-04-06 14:15:00', '2026-04-06 14:15:46', 32, 20);

-- --------------------------------------------------------

--
-- Table structure for table `certification`
--

CREATE TABLE `certification` (
  `id_certif` int(11) NOT NULL,
  `date_obtient` date DEFAULT NULL,
  `university` varchar(150) DEFAULT NULL,
  `competence` varchar(150) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `id_user` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `company`
--

CREATE TABLE `company` (
  `id_company` int(11) NOT NULL,
  `nom` varchar(150) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `secteur` varchar(100) DEFAULT NULL,
  `pays` varchar(100) DEFAULT NULL,
  `site_web` varchar(255) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `id_user` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `company`
--

INSERT INTO `company` (`id_company`, `nom`, `description`, `logo`, `email`, `telephone`, `secteur`, `pays`, `site_web`, `type`, `id_user`) VALUES
(1, 'TechCorp', 'Leading company in TechCorp sector', NULL, 'contact@techcorp.com', NULL, 'Technology', NULL, NULL, NULL, 12),
(2, 'DesignHub', 'Leading company in DesignHub sector', NULL, 'contact@designhub.com', NULL, 'Technology', NULL, NULL, NULL, 13),
(3, 'DataTech', 'Leading company in DataTech sector', NULL, 'contact@datatech.com', NULL, 'Technology', NULL, NULL, NULL, 14),
(4, 'PM Solutions', 'Leading company in PM Solutions sector', NULL, 'contact@pm solutions.com', NULL, 'Technology', NULL, NULL, NULL, 15),
(12, 'Tech Corp 1', 'cytuvyiuoi', NULL, 'viuoijo@tygku', '2525525', 'Technology', 'ytfuygio_puç', '', 'eeeeeeeee', 25),
(13, 'Design Studio', NULL, NULL, NULL, NULL, 'Design', NULL, NULL, NULL, 26),
(14, 'Data Analytics Inc', NULL, NULL, NULL, NULL, 'Analytics', NULL, NULL, NULL, 27),
(15, 'Project Solutions', NULL, NULL, NULL, NULL, 'Consulting', NULL, NULL, NULL, 28),
(16, 'aeros ', 'company of travelling', '1775480736462-2025-04-30-075157445-New_PwC_logo_spot.jpg', 'aeros@gmail.com', '2562525', 'technologie', 'Tunis', 'https://www.facebook.com/', 'tufyguhi', 8),
(17, 'Trabelsi Adem', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 22),
(18, 'Company of recruiter@test.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 23),
(19, 'club african', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 24),
(20, 'Trabelsi Adem', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 29);

-- --------------------------------------------------------

--
-- Table structure for table `demande_visa`
--

CREATE TABLE `demande_visa` (
  `id_demande` int(11) NOT NULL,
  `date_demande` date DEFAULT NULL,
  `statut` varchar(50) DEFAULT NULL,
  `commentaire_admin` text DEFAULT NULL,
  `type_visa` varchar(100) DEFAULT NULL,
  `date_debut` date DEFAULT NULL,
  `date_fin` date DEFAULT NULL,
  `id_user` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fichier`
--

CREATE TABLE `fichier` (
  `id_fichier` int(11) NOT NULL,
  `nom` varchar(150) DEFAULT NULL,
  `date_creation` date DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `id_entreprise` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `matching`
--

CREATE TABLE `matching` (
  `id_matching` int(11) NOT NULL,
  `score` int(11) DEFAULT NULL,
  `note` int(11) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `id_candidature` int(11) DEFAULT NULL,
  `id_offre` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `matching`
--

INSERT INTO `matching` (`id_matching`, `score`, `note`, `date`, `id_candidature`, `id_offre`) VALUES
(5, 87, 5, '2026-04-05', 5, 14),
(7, 89, 5, '2026-04-05', 7, 13),
(9, 75, 5, '2026-04-05', 9, 15);

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `id_notif` int(11) NOT NULL,
  `type` varchar(100) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `date` date DEFAULT NULL,
  `lu` tinyint(1) DEFAULT 0,
  `id_user` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notification`
--

INSERT INTO `notification` (`id_notif`, `type`, `message`, `date`, `lu`, `id_user`) VALUES
(2, 'application_received', NULL, '2026-03-27', 0, 8),
(3, 'interview_scheduled', NULL, '2026-03-27', 0, 8),
(4, 'offer_sent', NULL, '2026-03-27', 0, 8);

-- --------------------------------------------------------

--
-- Table structure for table `offre`
--

CREATE TABLE `offre` (
  `id_offre` int(11) NOT NULL,
  `titre` varchar(150) DEFAULT NULL,
  `type_contrat` varchar(100) DEFAULT NULL,
  `localisation` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `salaire` decimal(10,2) DEFAULT NULL,
  `experience` varchar(100) DEFAULT NULL,
  `date_pub` date DEFAULT NULL,
  `statut` varchar(50) DEFAULT NULL,
  `nombre_vues` int(11) DEFAULT 0,
  `date_expiration` date DEFAULT NULL,
  `id_entreprise` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `offre`
--

INSERT INTO `offre` (`id_offre`, `titre`, `type_contrat`, `localisation`, `description`, `salaire`, `experience`, `date_pub`, `statut`, `nombre_vues`, `date_expiration`, `id_entreprise`) VALUES
(13, 'UX/UI Designer', 'CDI', 'nabeul', 'Exciting opportunity for UX/UI Designer position', 4000.00, '2+ years', '2026-02-11', 'OUVERT', 0, '2026-05-07', 16),
(14, 'Data Scientist', 'CDI', 'sfax', 'Exciting opportunity for Data Scientist position', 4000.00, '2+ years', '2026-02-10', 'OUVERT', 0, '2026-05-09', 16),
(15, 'Project Manager', 'CDI', 'sousse', 'Exciting opportunity for Project Manager position', 3500.00, '2+ years', '2026-01-15', 'OUVERT', 0, '2026-04-13', 16),
(17, 'xcguh', 'CIVP', 'cgvhbjiok', 'cfgvhbjklxrytfuygiuhoijpok^pdtfyguhi', 1155.00, 'JUNIOR', '2026-04-05', 'OUVERT', 0, '2026-05-05', 12),
(20, 'Senior Full-Stack Developer (React)', 'CDI', 'Tunisie', 'We’re hiring a Senior Full-Stack Developer to build scalable web apps.\n\nMust-have skills:\nReact, TypeScript, Node.js, Express, REST API, SQL, Git, Docker\n\nNice-to-have:\nAWS, Kubernetes, Redis, CI/CD, Testing (Jest)\n\nResponsibilities:\n- Build React UI components and Node.js APIs\n- Design database schemas and optimize queries\n- Ship features with clean code and reviews', 5000.00, 'JUNIOR', '2026-04-06', 'OUVERT', 0, '2026-05-05', 16);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id_user` int(11) NOT NULL,
  `nom` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `role` enum('ADMIN','CANDIDAT','ENTREPRISE') NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `pays` varchar(100) DEFAULT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `date_inscription` datetime DEFAULT current_timestamp(),
  `civilite` enum('Mr','Mme','Mlle') DEFAULT NULL,
  `date_naissance` date DEFAULT NULL,
  `cv` varchar(255) DEFAULT NULL,
  `niveau_etude` varchar(100) DEFAULT NULL,
  `specialite` varchar(150) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `github` varchar(255) DEFAULT NULL,
  `portfolio` varchar(255) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `experience` varchar(150) DEFAULT NULL,
  `nom_entreprise` varchar(150) DEFAULT NULL,
  `description_entreprise` text DEFAULT NULL,
  `identifiant_entreprise` varchar(100) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `secteur` varchar(100) DEFAULT NULL,
  `site_web` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id_user`, `nom`, `email`, `mot_de_passe`, `role`, `telephone`, `pays`, `adresse`, `date_inscription`, `civilite`, `date_naissance`, `cv`, `niveau_etude`, `specialite`, `bio`, `avatar`, `linkedin`, `github`, `portfolio`, `is_verified`, `experience`, `nom_entreprise`, `description_entreprise`, `identifiant_entreprise`, `logo`, `secteur`, `site_web`) VALUES
(8, 'aeros', 'aeros@gmail.com', '$2b$10$c3fWYrAX3Uap1jmhnp84WuaF3rakucBNFYWiU2KiL7K67EaUi8LJa', 'ENTREPRISE', NULL, NULL, 'Béja ', '2026-02-21 15:15:04', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 'aeros', NULL, NULL, NULL, 'vente', 'https://aeros-advising.com/'),
(10, 'houwaida kh', 'houwaida@gmail.com', '$2b$10$P4Kat9TJmJiL4zyBskLTa.NrDOFFXodUxEOKLnaS8Ur9TaMhXYFSC', 'CANDIDAT', '58611227', 'Tunisia', 'beja', '2026-02-22 14:28:35', NULL, NULL, '1775425973663-BanniÃ¨re_LinkedIn_Architecte_Moderne_Blanc_et_Noir.pdf', 'txrycuygiuhi', 'Développement Web', 'xrtyuhij', '1775472235887-1752504405529.jpg', 'https://www.linkedin.com/in/wael-riahi-', 'https://www.linkedin.com/in/wael-riahi-', 'https://www.linkedin.com/in/wael-riahi-', 0, '1', NULL, 'looking for job', NULL, '1773141117495-images.jpg', NULL, NULL),
(11, 'adem', 'adem@gmail.com', '$2b$10$8vNb7BykydzVwC.lFR3PEegBoJc6c1D3uCo1PLSY9PZbmTjDQzNB.', 'CANDIDAT', NULL, 'Tunisie', 'Béja ', '2026-02-23 09:27:32', '', '2003-08-15', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(12, 'TechCorp Contact', 'contact@techcorp.com', '$2b$10$Yx5nMFuoGHjNpRH0CKKd.egr2KvU4Zt8qsqYouH3LY5igySpUtGKC', 'ENTREPRISE', NULL, NULL, NULL, '2026-03-27 22:12:32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'TechCorp', 'Leading company in TechCorp sector', NULL, NULL, 'Technology', NULL),
(13, 'DesignHub Contact', 'contact@designhub.com', '$2b$10$K4143hZOVlHjEx1Qo.E5mutEhZos6oNqzghX5EnEeLg4iSX6iEhfy', 'ENTREPRISE', NULL, NULL, NULL, '2026-03-27 22:14:05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'DesignHub', 'Leading company in DesignHub sector', NULL, NULL, 'Technology', NULL),
(14, 'DataTech Contact', 'contact@datatech.com', '$2b$10$K4143hZOVlHjEx1Qo.E5mutEhZos6oNqzghX5EnEeLg4iSX6iEhfy', 'ENTREPRISE', NULL, NULL, NULL, '2026-03-27 22:14:05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'DataTech', 'Leading company in DataTech sector', NULL, NULL, 'Technology', NULL),
(15, 'PM Solutions Contact', 'contact@pm solutions.com', '$2b$10$K4143hZOVlHjEx1Qo.E5mutEhZos6oNqzghX5EnEeLg4iSX6iEhfy', 'ENTREPRISE', NULL, NULL, NULL, '2026-03-27 22:14:05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'PM Solutions', 'Leading company in PM Solutions sector', NULL, NULL, 'Technology', NULL),
(16, 'Ahmed Ben Ali', 'ahmed.benali@email.com', '$2b$10$UYNWn39QY.NvQeHHJQxuXehqiEUpmkmpgp5RNN3vqy94jb9lVcbU2', 'CANDIDAT', '+216 20 123 456', 'Tunisia', 'Tunis', '2026-03-27 22:18:57', 'Mr', NULL, NULL, NULL, 'Full-Stack Developer', NULL, NULL, NULL, NULL, NULL, 1, '5 years exp', NULL, NULL, NULL, NULL, NULL, NULL),
(17, 'faaaaatma', 'fatma.khelifi@email.com', '$2b$10$UYNWn39QY.NvQeHHJQxuXehqiEUpmkmpgp5RNN3vqy94jb9lVcbU2', 'CANDIDAT', '+216 21 234 567', 'Tunisia', 'Ariana', '2026-03-27 22:18:57', 'Mme', NULL, NULL, NULL, 'Data Scientist', NULL, NULL, NULL, NULL, NULL, 1, '3 years exp', NULL, NULL, NULL, NULL, NULL, NULL),
(18, 'Mohamed Trabelsi', 'mohamed.trabelsi@email.com', '$2b$10$UYNWn39QY.NvQeHHJQxuXehqiEUpmkmpgp5RNN3vqy94jb9lVcbU2', 'CANDIDAT', '+216 22 345 678', 'Tunisia', 'Sfax', '2026-03-27 22:18:57', 'Mr', NULL, NULL, NULL, 'Mobile Developer', NULL, NULL, NULL, NULL, NULL, 1, '4 years exp', NULL, NULL, NULL, NULL, NULL, NULL),
(19, 'Yasmine Mansouri', 'yasmine.mansouri@email.com', '$2b$10$UYNWn39QY.NvQeHHJQxuXehqiEUpmkmpgp5RNN3vqy94jb9lVcbU2', 'CANDIDAT', '+216 23 456 789', 'Tunisia', 'Tunis', '2026-03-27 22:18:57', 'Mme', NULL, NULL, NULL, 'UX Designer', NULL, NULL, NULL, NULL, NULL, 1, '6 years exp', NULL, NULL, NULL, NULL, NULL, NULL),
(20, 'Karim Jebali', 'karim.jebali@email.com', '$2b$10$UYNWn39QY.NvQeHHJQxuXehqiEUpmkmpgp5RNN3vqy94jb9lVcbU2', 'CANDIDAT', '+216 24 567 890', 'Tunisia', 'Remote', '2026-03-27 22:18:57', 'Mr', NULL, NULL, NULL, 'DevOps Engineer', NULL, NULL, NULL, NULL, NULL, 1, '7 years exp', NULL, NULL, NULL, NULL, NULL, NULL),
(21, 'Sarra Bouguerra', 'sarra.bouguerra@email.com', '$2b$10$UYNWn39QY.NvQeHHJQxuXehqiEUpmkmpgp5RNN3vqy94jb9lVcbU2', 'CANDIDAT', '+216 25 678 901', 'Tunisia', 'Sousse', '2026-03-27 22:18:57', 'Mme', NULL, NULL, NULL, 'Marketing Specialist', NULL, NULL, NULL, NULL, NULL, 1, '2 years exp', NULL, NULL, NULL, NULL, NULL, NULL),
(22, 'Trabelsi Adem', 'tadem7235@gmail.com', '$2b$10$PDz8xpuLyKkNtBzaarwjTuGPM.Gx0ooBvRkJ/x5CKk3zlDR7fATbi', 'ENTREPRISE', NULL, NULL, 'gbouulat', '2026-03-30 12:01:58', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 'Trabelsi Adem', NULL, NULL, NULL, 'beja', 'http://localhost:5173/'),
(23, 'Test Recruiter', 'recruiter@test.com', '$2b$10$hGk/TqeYAlAxJ637Dh/wFu0malS5GHH1eO0aX5tYoOVqRb6BL.txO', 'ENTREPRISE', NULL, NULL, NULL, '2026-04-02 09:05:07', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(24, 'club african', 'clubafrican@test.com', '$2b$10$2zk4gxCSgOmOG46md4EhM.BTcPtx8jTLM2628dEYaSx0.UZ72qISy', 'ENTREPRISE', NULL, NULL, 'beb jdyd', '2026-04-02 10:11:54', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 'club african', NULL, NULL, NULL, 'foot', 'https://clubafricain.com/'),
(25, 'Recruiter 1', 'recruiter1@test.com', '$2b$10$c3fWYrAX3Uap1jmhnp84WuaF3rakucBNFYWiU2KiL7K67EaUi8LJa', 'ENTREPRISE', NULL, NULL, NULL, '2026-04-02 10:19:27', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(26, 'Recruiter 2', 'recruiter2@test.com', '$2b$10$q6fjQZVwxLVTZW6sGxvS0uMDOITY3Q4ubjRiBBtr21cWDFljkflgC', 'ENTREPRISE', NULL, NULL, NULL, '2026-04-02 10:19:27', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(27, 'Recruiter 3', 'recruiter3@test.com', '$2b$10$q3skuCjg.BFChFdoTKPoIuR.6s5F9Dh/HBB5WrWNkC3g9y5iIb9t.', 'ENTREPRISE', NULL, NULL, NULL, '2026-04-02 10:19:27', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(28, 'Recruiter 4', 'recruiter4@test.com', '$2b$10$idJV3i5a9q0NukklsoI/OeHWnpVl9ZwrLgYyUOsgR1dfe5IRTtf72', 'ENTREPRISE', NULL, NULL, NULL, '2026-04-02 10:19:27', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(29, 'Trabelsi Adem', 'beja@gmail.com', '$2b$10$zBQ3ht95UX3zy.4nW.hU9e6Bb5oTssUM8tItFRKfSL1Gi2PMkf7EW', 'ENTREPRISE', NULL, NULL, 'gbouulat', '2026-04-02 12:10:15', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 'Trabelsi Adem', NULL, NULL, NULL, 'foot', 'https://clubafricain.com/'),
(30, 'Trabelsi Adem', 'ad@gmail.com', '$2b$10$6kvPzm7J0QZvH/eSbbzNyu6xcGStmMIUs8WEVhbSH15Ixbu51fHG6', 'CANDIDAT', NULL, 'Tunisie', 'gbouulat', '2026-04-02 12:11:37', 'Mr', '2023-06-07', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(31, 'adem', 'aeross@gmail.com', '$2b$10$xjUthKN2Inz3EsJp2E2S6up7pvt6NNKgFuHj8cCvxZ0/NY.N/Irau', 'CANDIDAT', NULL, 'Tunisie', 'beja', '2026-04-02 15:33:53', 'Mr', '2026-04-03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(32, 'Wael Rh', 'Waellriahii@gmail.com', '$2b$10$8Vg0rdQLMC7uSfl39g7.Ce6hRxmmkyx8km6QevmWy5tvxPmiqimfC', 'CANDIDAT', '26423445', 'Tunisia', 'Manouba', '2026-04-06 13:20:56', 'Mr', '2001-05-15', '1775480990042-wael_c.v_ang.docx', 'Master degree', 'React, TypeScript, Node.js, Express, REST API, SQL, Git', 'I am an Information Systems Development student at the Higher Institute of Technological Studies of Kélibia with hands-on experience in IT, web development, and database management. My internships have enhanced my skills in Angular, UiPath, and Robotic Process Automation (RPA). I also hold certifications from NVIDIA in AI applications and deep learning, which complement my technical abilities and drive for innovation.', '1775478184438-476461031_1776625743134466_3357238232363454649_n_(1).jpg', 'https://www.linkedin.com/in/wael-riahi-', 'https://www.linkedin.com/in/wael-riahi-', 'https://www.linkedin.com/in/wael-riahi-', 0, '5', NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `visa`
--

CREATE TABLE `visa` (
  `id_visa` int(11) NOT NULL,
  `pays` varchar(100) DEFAULT NULL,
  `date_creation` date DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `statut` varchar(50) DEFAULT NULL,
  `date_validation` date DEFAULT NULL,
  `id_demande` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `candidature`
--
ALTER TABLE `candidature`
  ADD PRIMARY KEY (`id_candidature`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_offre` (`id_offre`);

--
-- Indexes for table `certification`
--
ALTER TABLE `certification`
  ADD PRIMARY KEY (`id_certif`),
  ADD KEY `id_user` (`id_user`);

--
-- Indexes for table `company`
--
ALTER TABLE `company`
  ADD PRIMARY KEY (`id_company`),
  ADD KEY `id_user` (`id_user`);

--
-- Indexes for table `demande_visa`
--
ALTER TABLE `demande_visa`
  ADD PRIMARY KEY (`id_demande`),
  ADD KEY `id_user` (`id_user`);

--
-- Indexes for table `fichier`
--
ALTER TABLE `fichier`
  ADD PRIMARY KEY (`id_fichier`),
  ADD KEY `id_entreprise` (`id_entreprise`);

--
-- Indexes for table `matching`
--
ALTER TABLE `matching`
  ADD PRIMARY KEY (`id_matching`),
  ADD KEY `id_candidature` (`id_candidature`),
  ADD KEY `id_offre` (`id_offre`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id_notif`),
  ADD KEY `id_user` (`id_user`);

--
-- Indexes for table `offre`
--
ALTER TABLE `offre`
  ADD PRIMARY KEY (`id_offre`),
  ADD KEY `id_entreprise` (`id_entreprise`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `visa`
--
ALTER TABLE `visa`
  ADD PRIMARY KEY (`id_visa`),
  ADD KEY `id_demande` (`id_demande`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `candidature`
--
ALTER TABLE `candidature`
  MODIFY `id_candidature` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `certification`
--
ALTER TABLE `certification`
  MODIFY `id_certif` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `company`
--
ALTER TABLE `company`
  MODIFY `id_company` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `demande_visa`
--
ALTER TABLE `demande_visa`
  MODIFY `id_demande` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fichier`
--
ALTER TABLE `fichier`
  MODIFY `id_fichier` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `matching`
--
ALTER TABLE `matching`
  MODIFY `id_matching` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `id_notif` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `offre`
--
ALTER TABLE `offre`
  MODIFY `id_offre` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `visa`
--
ALTER TABLE `visa`
  MODIFY `id_visa` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `candidature`
--
ALTER TABLE `candidature`
  ADD CONSTRAINT `candidature_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `candidature_ibfk_2` FOREIGN KEY (`id_offre`) REFERENCES `offre` (`id_offre`) ON DELETE CASCADE;

--
-- Constraints for table `certification`
--
ALTER TABLE `certification`
  ADD CONSTRAINT `certification_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `company`
--
ALTER TABLE `company`
  ADD CONSTRAINT `company_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `demande_visa`
--
ALTER TABLE `demande_visa`
  ADD CONSTRAINT `demande_visa_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `fichier`
--
ALTER TABLE `fichier`
  ADD CONSTRAINT `fichier_ibfk_1` FOREIGN KEY (`id_entreprise`) REFERENCES `user` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `matching`
--
ALTER TABLE `matching`
  ADD CONSTRAINT `matching_ibfk_1` FOREIGN KEY (`id_candidature`) REFERENCES `candidature` (`id_candidature`) ON DELETE CASCADE,
  ADD CONSTRAINT `matching_ibfk_2` FOREIGN KEY (`id_offre`) REFERENCES `offre` (`id_offre`) ON DELETE CASCADE;

--
-- Constraints for table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `offre`
--
ALTER TABLE `offre`
  ADD CONSTRAINT `offre_ibfk_1` FOREIGN KEY (`id_entreprise`) REFERENCES `user` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `visa`
--
ALTER TABLE `visa`
  ADD CONSTRAINT `visa_ibfk_1` FOREIGN KEY (`id_demande`) REFERENCES `demande_visa` (`id_demande`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
