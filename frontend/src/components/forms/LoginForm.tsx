import { useState } from "react";
import { useLoginMutation } from "../../store/api/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login({ email, password }).unwrap();
      dispatch(setCredentials(data));
      navigate("/");
    } catch {
      alert("Email ou mot de passe incorrect");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        required
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Mot de passe"
        required
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Connexion</button>
    </form>
  );
};

export default LoginForm;
