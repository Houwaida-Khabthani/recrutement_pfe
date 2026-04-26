
import { useGetStatsQuery } from "../../store/api/adminApi";

function AdminStatistics() {
  const { data: stats, isLoading, isError } = useGetStatsQuery(undefined);

  return (
    <div className="layout">
      
      <div className="main">
       
        <div className="content">
          <div className="page-header">
            <h2>Statistiques de la Plateforme</h2>
            <p>Vue d'ensemble de l'activité du site</p>
          </div>

          {isLoading && <p>Chargement des statistiques...</p>}
          {isError && <p>Erreur lors du chargement des statistiques</p>}

          {!isLoading && stats && (
            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px", marginTop: "20px" }}>
              
              <div className="stat-card" style={{ background: "#e3f2fd", padding: "20px", borderRadius: "8px", textAlign: "center" }}>
                <h4 style={{ color: "#1565c0" }}>Total Utilisateurs</h4>
                <p style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "10px 0" }}>{stats.totalUsers || 0}</p>
                <div style={{ display: "flex", justifyContent: "space-around", fontSize: "0.9rem" }}>
                  <span>Candidats: {stats.candidates || 0}</span>
                  <span>Recruteurs: {stats.recruiters || 0}</span>
                </div>
              </div>

              <div className="stat-card" style={{ background: "#fff3cd", padding: "20px", borderRadius: "8px", textAlign: "center" }}>
                <h4 style={{ color: "#856404" }}>Offres d'Emploi</h4>
                <p style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "10px 0" }}>{stats.totalJobs || 0}</p>
                <p>Actives: {stats.activeJobs || 0}</p>
              </div>

              <div className="stat-card" style={{ background: "#d1e7dd", padding: "20px", borderRadius: "8px", textAlign: "center" }}>
                <h4 style={{ color: "#0f5132" }}>Candidatures</h4>
                <p style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "10px 0" }}>{stats.totalApplications || 0}</p>
                <p>Acceptées: {stats.acceptedApplications || 0}</p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminStatistics;
