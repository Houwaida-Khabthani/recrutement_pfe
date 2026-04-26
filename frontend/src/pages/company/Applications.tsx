import React, { useState } from 'react';
import {
  useGetCompanyApplicationsQuery,
  useUpdateApplicationStatusMutation
} from '../../store/api/applicationApi';
import {
  Users,
  Clock,
  Search,
  Mail,
  MapPin,
  Briefcase,
  FileText,
  X,
  Phone
} from 'lucide-react';
// import { FaGithub, FaLinkedin } from 'react-icons/fa';

const Applications: React.FC = () => {
  const { data: applications = [], isLoading, refetch } = useGetCompanyApplicationsQuery({});
  const [updateStatus, { isLoading: isUpdating }] = useUpdateApplicationStatusMutation();

  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);

  const getField = (candidate: any, ...keys: string[]) =>
    keys.find((key) => candidate?.[key]) ? candidate[keys.find((key) => candidate?.[key]) as string] : '';

  const buildUploadUrl = (value?: string, folder = '') => {
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
    const baseUrl = (import.meta.env.VITE_UPLOAD_URL || 'http://localhost:5000/uploads').replace(/\/$/, '');
    const cleanedValue = value.replace(/^\/+/, '');
    if (cleanedValue.startsWith('uploads/')) {
      return `${baseUrl.replace(/\/uploads$/, '')}/${cleanedValue}`;
    }
    if (cleanedValue.includes('/')) {
      return `${baseUrl}/${cleanedValue.split('/').map(encodeURIComponent).join('/')}`;
    }
    return folder ? `${baseUrl}/${folder}/${encodeURIComponent(cleanedValue)}` : `${baseUrl}/${encodeURIComponent(cleanedValue)}`;
  };

  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    try {
      await updateStatus({ id: applicationId, status: newStatus }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const openProfile = (candidate: any) => {
    setSelectedCandidate(candidate);
    setShowProfile(true);
  };

  const closeProfile = () => {
    setShowProfile(false);
    setSelectedCandidate(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'Acceptée';
      case 'REJECTED': return 'Rejetée';
      case 'PENDING': return 'En attente';
      case 'UNDER_REVIEW': return 'En cours d\'examen';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidatures Reçues</h1>
          <p className="text-gray-600">Gérez les candidatures pour vos offres d'emploi</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter((app: any) => app.statut === 'PENDING').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En examen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter((app: any) => app.statut === 'UNDER_REVIEW').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Décisions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter((app: any) => app.statut === 'ACCEPTED' || app.statut === 'REJECTED').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Toutes les candidatures</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Poste
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((application: any) => (
                  <tr key={application.id_candidature} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {application.candidate_name?.charAt(0).toUpperCase() || 'C'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {application.candidate_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.candidate_email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{application.job_title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={application.statut}
                        onChange={(e) => handleStatusChange(application.id_candidature, e.target.value)}
                        disabled={isUpdating}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.statut)}`}
                      >
                        <option value="PENDING">En attente</option>
                        <option value="UNDER_REVIEW">En cours d'examen</option>
                        <option value="ACCEPTED">Acceptée</option>
                        <option value="REJECTED">Rejetée</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.date_candidature).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openProfile(application)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Voir profil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Candidate Profile Modal */}
        {showProfile && selectedCandidate && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Profil du candidat</h3>
                <button
                  onClick={closeProfile}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Informations personnelles</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Nom: {selectedCandidate.candidate_name}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Email: {selectedCandidate.candidate_email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Téléphone: {getField(selectedCandidate, 'telephone', 'phone')}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Adresse: {getField(selectedCandidate, 'adresse', 'address')}</span>
                    </div>
                  </div>
                </div>

                {/* Application Details */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Détails de la candidature</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Poste: {selectedCandidate.job_title}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        Date: {new Date(selectedCandidate.date_candidature).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(selectedCandidate.statut)}`}>
                        Statut: {getStatusText(selectedCandidate.statut)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CV Download */}
              {selectedCandidate.candidate_cv_url && (
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-2">CV</h4>
                  <a
                    href={buildUploadUrl(selectedCandidate.candidate_cv_url, 'cvs')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Télécharger le CV
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;