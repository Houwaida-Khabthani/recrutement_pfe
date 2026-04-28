export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}\[\]|\\:;"'<>,.?/~`]).{8,}$/;
export const phoneRegex = /^[+()\d\s-]{8,20}$/;

export const isValidEmail = (value: string) => emailRegex.test(value.trim());
export const isStrongPassword = (value: string) => passwordRegex.test(value);
export const isValidPhone = (value: string) => phoneRegex.test(value.trim());
export const isValidUrl = (value: string) => {
  if (!value) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const getAge = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  const dayDiff = now.getDate() - date.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }
  return age;
};

export const isValidDate = (value: string) => {
  const d = new Date(value);
  return value.trim() !== '' && !Number.isNaN(d.getTime());
};

export const isNotPastDate = (value: string) => {
  if (!isValidDate(value)) return false;
  const selected = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);
  return selected >= today;
};

export const validateLoginForm = (form: { email?: string; password?: string }) => {
  const errors: Record<string, string> = {};

  if (!form.email?.trim()) {
    errors.email = "L'email est obligatoire";
  } else if (!isValidEmail(form.email)) {
    errors.email = "L'email doit être au format valide";
  }

  if (!form.password) {
    errors.password = "Le mot de passe est obligatoire";
  }

  return errors;
};

export const validateRegisterForm = (form: Record<string, string>, role: string) => {
  const errors: Record<string, string> = {};

  if (role === 'CANDIDAT') {
    if (!form.nom?.trim()) {
      errors.nom = 'Le nom complet est obligatoire';
    }
    if (!form.date_naissance) {
      errors.date_naissance = 'La date de naissance est obligatoire';
    } else if (!isValidDate(form.date_naissance)) {
      errors.date_naissance = 'La date de naissance doit être au format YYYY-MM-DD';
    } else if (getAge(form.date_naissance) < 18) {
      errors.date_naissance = 'Vous devez avoir au moins 18 ans';
    }
  }

  if (role === 'ENTREPRISE') {
    if (!form.nom_entreprise?.trim()) {
      errors.nom_entreprise = 'Le nom de l’entreprise est obligatoire';
    }
    if (!form.secteur?.trim()) {
      errors.secteur = 'Le secteur est obligatoire';
    }
  }

  if (!form.email?.trim()) {
    errors.email = "L'email est obligatoire";
  } else if (!isValidEmail(form.email)) {
    errors.email = 'L’email n’est pas valide';
  }

  if (!form.password) {
    errors.password = 'Le mot de passe est obligatoire';
  } else if (!isStrongPassword(form.password)) {
    errors.password = 'Le mot de passe doit comporter 8 caractères, une majuscule, un chiffre et un caractère spécial';
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'La confirmation du mot de passe est obligatoire';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas';
  }

  if (form.telephone && !isValidPhone(form.telephone)) {
    errors.telephone = 'Numéro de téléphone invalide';
  }

  if (form.site_web && !isValidUrl(form.site_web)) {
    errors.site_web = 'L’URL du site web est invalide';
  }

  return errors;
};

export const validateProfileForm = (form: Record<string, string>) => {
  const errors: Record<string, string> = {};

  if (!form.nom?.trim()) {
    errors.nom = 'Le nom est obligatoire';
  }

  if (form.telephone && !isValidPhone(form.telephone)) {
    errors.telephone = 'Numéro de téléphone invalide';
  }

  if (form.linkedin && !isValidUrl(form.linkedin)) {
    errors.linkedin = 'L’URL LinkedIn est invalide';
  }

  if (form.github && !isValidUrl(form.github)) {
    errors.github = 'L’URL GitHub est invalide';
  }

  if (form.portfolio && !isValidUrl(form.portfolio)) {
    errors.portfolio = 'L’URL du portfolio est invalide';
  }

  return errors;
};

export const validateJobForm = (form: Record<string, string>) => {
  const errors: Record<string, string> = {};

  if (!form.titre?.trim()) {
    errors.titre = 'Le titre du poste est obligatoire';
  }

  if (!form.secteur?.trim()) {
    errors.secteur = 'Le secteur est obligatoire';
  }

  if (!form.localisation?.trim()) {
    errors.localisation = 'La localisation est obligatoire';
  }

  if (!form.type_contrat?.trim()) {
    errors.type_contrat = 'Le type de contrat est obligatoire';
  }

  if (!form.description?.trim() || form.description.trim().length < 20) {
    errors.description = 'La description doit comporter au moins 20 caractères';
  }

  if (form.salaire && Number(form.salaire) < 0) {
    errors.salaire = 'Le salaire doit être un nombre positif';
  }

  if (form.date_expiration && !isValidDate(form.date_expiration)) {
    errors.date_expiration = 'La date d’expiration doit être au format YYYY-MM-DD';
  }

  if (form.date_expiration && !isNotPastDate(form.date_expiration)) {
    errors.date_expiration = 'La date d’expiration ne peut pas être dans le passé';
  }

  return errors;
};
