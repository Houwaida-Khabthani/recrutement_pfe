import { useNavigate } from "react-router-dom";

interface ApplicationCardProps {
  application: any;
}

function ApplicationCard({ application }: ApplicationCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="application-card"
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "15px",
        marginBottom: "10px",
        cursor: "pointer",
        transition: "box-shadow 0.2s",
      }}
      onClick={() => navigate(`/candidate/applications/${application.id}`)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h4>{application.job?.title || "Job Title"}</h4>
          <p style={{ color: "#666" }}>{application.job?.company?.name || "Company Name"}</p>
        </div>
        <div 
          style={{ 
            padding: "5px 12px", 
            borderRadius: "15px", 
            fontSize: "0.85rem",
            backgroundColor: application.status === "PENDING" ? "#fff3cd" : 
                            application.status === "ACCEPTED" ? "#d1e7dd" : "#f8d7da",
            color: application.status === "PENDING" ? "#856404" : 
                   application.status === "ACCEPTED" ? "#0f5132" : "#842029"
          }}
        >
          {application.status}
        </div>
      </div>
      <p style={{ fontSize: "0.85rem", marginTop: "10px" }}>
        Postulé le: {new Date(application.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}

export default ApplicationCard;
