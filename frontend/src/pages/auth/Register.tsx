import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useRegisterMutation } from "../../store/api/authApi";

function Register() {
  const params = useParams();
  const urlRole = params.role || "CANDIDAT";
  const navigate = useNavigate();

  const [form, setForm] = useState<any>({});
  const [registerUser, { isLoading }] = useRegisterMutation();

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

    if (form.password !== form.confirmPassword) {
      return alert("Les mots de passe ne correspondent pas");
    }

    if (urlRole === "CANDIDAT") {
      if (!form.nom?.trim()) {
        return alert("Le nom est obligatoire");
      }
    } else if (urlRole === "ENTREPRISE") {
      if (!form.nom_entreprise?.trim()) {
        return alert("Le nom d'entreprise est obligatoire");
      }
    }

    if (!form.email?.trim()) {
      return alert("L'email est obligatoire");
    }

    if (!form.password?.trim()) {
      return alert("Le mot de passe est obligatoire");
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
              </div>

              <div className="form-group">
                <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
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
              </div>

              <div className="form-group">
                <input name="email" type="email" placeholder="Email professionnel" onChange={handleChange} required />
              </div>

              <div className="form-group">
                <input name="secteur" placeholder="Secteur d'activité" onChange={handleChange} required />
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
          </div>

          <div className="form-group">
            <input type="password" name="confirmPassword" placeholder="Confirmer le mot de passe" onChange={handleChange} required />
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
