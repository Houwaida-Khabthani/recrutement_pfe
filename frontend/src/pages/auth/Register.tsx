import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useRegisterMutation } from "../../store/api/authApi";
import { validateRegisterForm } from "../../utils/formValidation";
import { useFormValidation } from "../../hooks/useFormValidation";

function Register() {
  const params = useParams();
  const urlRole = params.role || "CANDIDAT";
  const navigate = useNavigate();

  const [form, setForm] = useState<any>({});
  const [registerUser, { isLoading }] = useRegisterMutation();
  const { errors, setErrors, resetErrors } = useFormValidation();

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setForm((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    resetErrors();

    const validationErrors = validateRegisterForm(form, urlRole);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const payload: any = {
        ...form,
        role: urlRole,
        mot_de_passe: form.password,
      };

      delete payload.password;
      delete payload.confirmPassword;

      await registerUser(payload).unwrap();

      alert("Inscription réussie ✅");
      navigate("/login/" + urlRole);
    } catch (err: any) {
      console.error(err);
      alert(err?.data?.message || "Erreur inscription");
    }
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-tabs">
          <Link
            to="/register/CANDIDAT"
            className={`role-tab ${urlRole === "CANDIDAT" ? "active" : ""}`}
          >
            Candidat
          </Link>
          <Link
            to="/register/ENTREPRISE"
            className={`role-tab ${urlRole === "ENTREPRISE" ? "active" : ""}`}
          >
            Recruteur
          </Link>
        </div>

        <h2>{urlRole === "CANDIDAT" ? "Créer un compte candidat" : "Créer un compte recruteur"}</h2>
        <p className="subheading">
          Rejoignez notre plateforme de recrutement et commencez à trouver les meilleures
          opportunités ou talents dès aujourd'hui.
        </p>

        <form onSubmit={handleSubmit}>
          {urlRole === "CANDIDAT" && (
            <>
              <div className="form-group">
                <input name="nom" placeholder="Nom complet" onChange={handleChange} required />
                {errors.nom && <span className="error-text">{errors.nom}</span>}
              </div>

              <div className="form-group">
                <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <select name="civilite" onChange={handleChange} required>
                  <option value="">Civilité</option>
                  <option value="Mr">Mr</option>
                  <option value="Mme">Mme</option>
                  <option value="Mlle">Mlle</option>
                </select>
              </div>

              <div className="form-group">
                <input type="date" name="date_naissance" onChange={handleChange} required />
                {errors.date_naissance && <span className="error-text">{errors.date_naissance}</span>}
              </div>

              <div className="form-group">
                <input name="pays" placeholder="Pays" onChange={handleChange} required />
              </div>

              <div className="form-group">
                <input name="adresse" placeholder="Adresse" onChange={handleChange} required />
              </div>
            </>
          )}

          {urlRole === "ENTREPRISE" && (
            <>
              <div className="form-group">
                <input name="nom_entreprise" placeholder="Nom de l'entreprise" onChange={handleChange} required />
                {errors.nom_entreprise && <span className="error-text">{errors.nom_entreprise}</span>}
              </div>

              <div className="form-group">
                <input name="email" type="email" placeholder="Email professionnel" onChange={handleChange} required />
              </div>

              <div className="form-group">
                <input name="secteur" placeholder="Secteur d'activité" onChange={handleChange} required />
                {errors.secteur && <span className="error-text">{errors.secteur}</span>}
              </div>

              <div className="form-group">
                <input name="site_web" placeholder="Site web" onChange={handleChange} />
              </div>

              <div className="form-group">
                <input name="adresse" placeholder="Adresse" onChange={handleChange} required />
              </div>
            </>
          )}

          <div className="form-group">
            <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} required />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <input type="password" name="confirmPassword" placeholder="Confirmer le mot de passe" onChange={handleChange} required />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Inscription..." : "Créer un compte"}
          </button>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate("/")}>
              Retour à l'accueil
            </button>
          </div>
        </form>

        <p className="small-text">
          Déjà un compte ? <Link to={`/login/${urlRole}`}>Se connecter</Link>
        </p>
      </div>

      <div className="register-panel">
        <div className="panel-content">
          <span className="panel-badge">TunisiaJobInnovate</span>
          <h1>Votre emploi de rêve vous attend</h1>
          <p>
            AI vous connecte aux opportunités qui correspondent parfaitement à vos compétences,
            votre expérience et vos objectifs de carrière.
          </p>

          <ul>
            <li>
              <span>✓</span>
              Matching intelligent pour candidats et recruteurs
            </li>
            <li>
              <span>✓</span>
              Processus d'inscription fluide et sécurisé
            </li>
            <li>
              <span>✓</span>
              Tableau de bord dès la première connexion
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Register;
