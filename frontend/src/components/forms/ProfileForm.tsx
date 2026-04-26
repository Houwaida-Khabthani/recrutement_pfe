import { useState, useEffect } from "react";
import { useUpdateCandidateProfileMutation } from "../../store/api/candidateApi";
import { useUpdateProfileMutation } from "../../store/api/companyApi";
import { useAppSelector } from "../../hooks/useAppDispatch";

export default function ProfileForm({ profile, setProfile }: any) {
  const user = useAppSelector((state) => state.auth.user);
  const [formData, setFormData] = useState(profile);

  const [updateCandidateProfile, { isLoading: isUpdatingCandidate }] = useUpdateCandidateProfileMutation();
  const [updateCompanyProfile, { isLoading: isUpdatingCompany }] = useUpdateProfileMutation();

  const isUpdating = isUpdatingCandidate || isUpdatingCompany;

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      if (user?.role === 'CANDIDATE') {
        await updateCandidateProfile(formData).unwrap();
      } else if (user?.role === 'COMPANY' || user?.role === 'RECRUITER') {
        await updateCompanyProfile(formData).unwrap();
      }
      setProfile(formData);
      alert("Profil mis à jour ✔️");
    } catch (error) {
      console.error("Update profile error:", error);
      alert("Erreur lors de la mise à jour du profil");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="nom" value={formData?.nom || ""} onChange={handleChange} placeholder="Nom" />
      <input name="telephone" value={formData?.telephone || ""} onChange={handleChange} placeholder="Téléphone" />
      <input name="pays" value={formData?.pays || ""} onChange={handleChange} placeholder="Pays" />
      <input name="adresse" value={formData?.adresse || ""} onChange={handleChange} placeholder="Adresse" />

      <select name="civilite" value={formData?.civilite || ""} onChange={handleChange}>
        <option value="">Civilité</option>
        <option value="Mr">Mr</option>
        <option value="Mme">Mme</option>
        <option value="Mlle">Mlle</option>
      </select>

      <input type="date" name="date_naissance" value={formData?.date_naissance || ""} onChange={handleChange} />
      <input name="niveau_etude" value={formData?.niveau_etude || ""} onChange={handleChange} placeholder="Niveau d'étude" />
      <input name="specialite" value={formData?.specialite || ""} onChange={handleChange} placeholder="Spécialité" />
      <input name="experience" value={formData?.experience || ""} onChange={handleChange} placeholder="Expérience" />
      <input name="cv" value={formData?.cv || ""} onChange={handleChange} placeholder="Lien CV" />

      <button type="submit" disabled={isUpdating}>
        {isUpdating ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
