import React from 'react';

interface CandidateCardProps {
  name: string;
  title: string;
  score: number;
  location: string;
  experience: string;
  appliedFor: string;
  skills: string[];
  status: string;
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  name,
  title,
  score,
  location,
  experience,
  appliedFor,
  skills,
  status
}) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'screening': return 'bg-yellow-100 text-yellow-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'offered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {initials}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{name}</h3>
            <p className="text-slate-500 text-sm">{title}</p>
          </div>
        </div>
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          {score}%
        </div>
      </div>

      <div className="mb-4">
        <p className="text-slate-600 text-sm flex items-center gap-1 mb-2">
          <span>📍</span> {location} • {experience}
        </p>
        <p className="font-semibold text-slate-900">Applied for: {appliedFor}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {skills.map(skill => (
          <span key={skill} className="bg-slate-100 text-slate-600 rounded-full px-3 py-1 text-xs font-medium">
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          View Profile
        </button>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>
    </div>
  );
};

export default CandidateCard;