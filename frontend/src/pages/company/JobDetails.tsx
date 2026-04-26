import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetJobByIdQuery } from '../../store/api/jobApi';
import Loader from '../../components/common/Loader';

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading } = useGetJobByIdQuery(id!);

  if (isLoading) return <Loader />;

  return (
    <div className="page-content">
      <h2>{job.titre}</h2>
      <p>{job.description}</p>
      <p>Contract Type: {job.type_contrat}</p>
      <p>Location: {job.localisation}</p>
      <p>Salary: {job.salaire}</p>
      <p>Status: {job.statut}</p>
      <p>Published on: {new Date(job.date_pub).toLocaleDateString()}</p>
      <p>Expiration: {job.date_expiration}</p>
    </div>
  );
};

export default JobDetails;