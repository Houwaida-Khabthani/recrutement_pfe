export type Experience = {
  poste: string;
  entreprise: string;
  debut: string;
  fin: string;
  description: string;
};

export type Education = {
  diplome: string;
  etablissement: string;
  debut: string;
  fin: string;
};

export type Project = {
  titre: string;
  description: string;
  lien: string;
};

export type Certification = {
  titre: string;
  organisme: string;
  annee: string;
};

export type CandidateProfile = {
  nom: string;
  telephone: string;
  specialite: string;
  bio: string;

  experiences: Experience[];
  educations: Education[];
  projects: Project[];
  certifications: Certification[];

  languages: string[];
  skills: string[];

  logo: string;
  cv: string;
  portfolio: string;
};