import { useState } from "react";
import { useRegisterMutation } from "../../store/api/authApi";
import type { Role } from "../../types/roles";

const RegisterForm = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "CANDIDATE" as Role,
  });

  const [register] = useRegisterMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(form).unwrap();
      alert("Compte créé avec succès !");
    } catch {
      alert("Erreur lors de l'inscription");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        required
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password"
        required
        placeholder="Mot de passe"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <select
        onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
      >
        <option value="CANDIDATE">Candidat</option>
        <option value="RECRUITER">Recruteur</option>
      </select>
      <button type="submit">S'inscrire</button>
    </form>
  );
};

export default RegisterForm;
