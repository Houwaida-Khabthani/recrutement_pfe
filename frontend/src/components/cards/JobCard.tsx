import { useNavigate } from "react-router-dom";

interface JobCardProps {
  job: any;
}

function JobCard({ job }: JobCardProps) {

  const navigate = useNavigate();

  return (
    <div
      className="job-card"
      onClick={() => navigate(`/candidate/jobs/${job.id}`)}
    >

      <h4>{job.title}</h4>

      <p>{job.company?.name}</p>

      <p>{job.location}</p>

      <p>{job.contractType}</p>

      <button
        className="btn-primary"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/candidate/jobs/${job.id}`);
        }}
      >
        Voir détails
      </button>

    </div>
  );
}

export default JobCard;
