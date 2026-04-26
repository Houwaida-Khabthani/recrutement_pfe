import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForgotPasswordMutation } from "../../store/api/authApi";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      await forgotPassword(email).unwrap();

      setMessage("Un lien de réinitialisation a été envoyé à votre email.");

      setTimeout(() => {
        navigate("/login/candidate");
      }, 3000);

    } catch (error: any) {
      console.error(error);
      setMessage(error?.data?.message || "Une erreur est survenue.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Mot de passe oublié</h2>

      {message && <p className="info-message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Entrez votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Envoi..." : "Réinitialiser"}
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;
