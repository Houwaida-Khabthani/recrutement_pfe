export enum ContractType {
  CDI = "CDI",
  CDD = "CDD",
  FREELANCE = "Freelance",
  STAGE = "Stage",
  ALTERNANCE = "Alternance",
}

export interface Job {
  id: string;
  title: string;
  description: string;
  companyId: string;
  location: string;
  salary?: string;
  contractType: ContractType;
  createdAt: string;
  company?: {
    nom_entreprise: string;
  };
}
