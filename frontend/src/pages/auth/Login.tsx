import { useNavigate, Link, useParams } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/slices/authSlice";
import { useLoginMutation } from "../../store/api/authApi";
import { UserRole } from "../../types/roles";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { role: urlRole } = useParams();
  const role = urlRole || "CANDIDAT";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await login({ email, password }).unwrap();

      const { user, token } = res;

      dispatch(
        setCredentials({
          user,
          token,
        })
      );

      // Navigate based on role
      if (user.role === UserRole.CANDIDAT) {
        navigate("/candidate/dashboard");
      } else if (user.role === UserRole.ENTREPRISE) {
        navigate("/company/dashboard");
      } else if (user.role === UserRole.ADMIN) {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      alert(error?.data?.message || "Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-tabs">
          <Link
            to="/login/CANDIDAT"
            className={`role-tab ${role === "CANDIDAT" ? "active" : ""}`}
          >
            Candidat
          </Link>
          <Link
            to="/login/ENTREPRISE"
            className={`role-tab ${role === "ENTREPRISE" ? "active" : ""}`}
          >
            Recruteur
          </Link>
        </div>

        <h2>Connexion {role === "CANDIDAT" ? "candidat" : "recruteur"}</h2>
        <p className="subheading">
          Connectez-vous à votre compte pour accéder à votre tableau de bord et gérer vos candidatures ou offres.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/")}
            >
              Retour à l'accueil
            </button>
          </div>

          <div className="small-text" style={{ marginTop: "20px" }}>
            <Link to={`/forgot-password/${role}`}>
              Mot de passe oublié ?
            </Link>
          </div>

          <div className="small-text" style={{ marginTop: "12px" }}>
            Pas de compte ? <Link to={`/register/${role}`}>Créer un compte</Link>
          </div>
        </form>
      </div>

      <div className="register-panel">
        <div className="panel-content">
          <span className="panel-badge">TunisiaJobInnovate</span>
          <h1>Bienvenue sur votre espace {role === "CANDIDAT" ? "candidat" : "recruteur"}</h1>
          <p>
            Accédez rapidement aux meilleures opportunités ou aux talents les plus pertinents grâce à une expérience de connexion fluide.
          </p>

          <ul>
            <li>
              <span>✓</span>
              Tableau de bord personnalisé
            </li>
            <li>
              <span>✓</span>
              Suivi facile des candidatures et offres
            </li>
            <li>
              <span>✓</span>
              Support sécurisé et rapide
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Login;
