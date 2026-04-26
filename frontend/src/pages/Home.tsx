import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-hero">
      <div className="home-card">
        <span className="brand-badge">TunisiaJobInnovate</span>
        <h1>Créez votre compte</h1>
        <p>
          Rejoignez des milliers de professionnels utilisant une plateforme de recrutement
          intelligente pour trouver votre prochain emploi ou les meilleurs talents.
        </p>

        <div className="role-buttons">
          <Link to="/register/CANDIDAT" className="role-button active">
            Candidat
          </Link>
          <Link to="/register/ENTREPRISE" className="role-button">
            Recruteur
          </Link>
        </div>

        <p className="footer-note">
          Vous avez déjà un compte ? <Link to="/login/CANDIDAT">Connectez-vous</Link>
        </p>
      </div>

      <div className="home-panel">
        <h2>Votre emploi de rêve vous attend</h2>
        <p>
          AI vous met en relation avec des opportunités qui correspondent à vos compétences,
          votre expérience et vos objectifs de carrière.
        </p>
      </div>
    </div>
  );
};

export default Home;
