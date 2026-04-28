ALTER TABLE `user`
  MODIFY `email` varchar(150) NOT NULL,
  ADD CONSTRAINT `user_email_unique` UNIQUE (`email`),
  ADD CONSTRAINT `user_minimum_age` CHECK (`date_naissance` IS NULL OR `date_naissance` <= DATE_SUB(CURDATE(), INTERVAL 18 YEAR));

ALTER TABLE `offre`
  MODIFY `titre` varchar(150) NOT NULL,
  MODIFY `type_contrat` varchar(100) NOT NULL,
  MODIFY `localisation` varchar(100) NOT NULL,
  MODIFY `description` text NOT NULL,
  ADD CONSTRAINT `offre_positive_salary` CHECK (`salaire` IS NULL OR `salaire` >= 0),
  ADD CONSTRAINT `offre_deadline_future` CHECK (`date_expiration` IS NULL OR `date_expiration` >= CURDATE());
