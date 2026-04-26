import { useState } from 'react';
import {
  FileText, Search, Filter, Trash2, CheckCircle, Clock, XCircle, AlertCircle,
  Sparkles
} from 'lucide-react';
import { useGetAllApplicationsQuery, useUpdateApplicationStatusMutation, useDeleteApplicationMutation } from "../../store/api/adminApi";

function AdminApplications() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: applications, isLoading, isError, refetch } = useGetAllApplicationsQuery({
    search: searchTerm,
    status: statusFilter
  });
  const [updateApplicationStatus, { isLoading: isUpdating }] = useUpdateApplicationStatusMutation();
  const [deleteApplication, { isLoading: isDeleting }] = useDeleteApplicationMutation();

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await updateApplicationStatus({ id, status }).unwrap();
      refetch();
      alert("Application status updated successfully");
    } catch (err: any) {
      alert(err.data?.message || "Error updating status");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        await deleteApplication(id).unwrap();
        refetch();
        alert("Application deleted successfully");
      } catch (err: any) {
        alert(err.data?.message || "Error deleting application");
      }
    }
  };

  const getStatusConfig = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string; icon: JSX.Element }> = {
      ACCEPTED: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Accepted', icon: <CheckCircle className="w-4 h-4" /> },
      REJECTED: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Rejected', icon: <XCircle className="w-4 h-4" /> },
      PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
      UNDER_REVIEW: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Under Review', icon: <AlertCircle className="w-4 h-4" /> }
    };
    return config[status] || { bg: 'bg-slate-100', text: 'text-slate-700', label: status, icon: <Clock className="w-4 h-4" /> };
  };

  return (
    <>
    

      <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <p className="text-indigo-600 text-[11px] font-black uppercase tracking-[4px] mb-1 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Applications
            </p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
              Manage All Applications 📋
            </h1>
            <p className="text-slate-500 font-medium text-base">
              Review, manage, and update application statuses across all job positions
            </p>
          </div>
        </div>

        {/* ── Search & Filters ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by candidate, job, or company..."
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition appearance-none cursor-pointer bg-white"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Applications Table ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {isLoading && (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-slate-500 font-medium">Loading applications...</p>
            </div>
          )}

          {isError && (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
              <p className="text-rose-600 font-medium">Error loading applications</p>
            </div>
          )}

          {!isLoading && applications?.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No applications found</p>
            </div>
          )}

          {!isLoading && applications && applications.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Candidate</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Job Title</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Company</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Status</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Date</th>
                    <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-widest text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((application: any) => {
                    const statusConfig = getStatusConfig(application.statut);
                    return (
                      <tr key={application.id_candidature} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                              {application.candidate_name?.charAt(0).toUpperCase() || 'C'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{application.candidate_name}</p>
                              <p className="text-xs text-slate-400">ID: {application.id_candidature}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">{application.job_title}</td>
                        <td className="px-6 py-4 text-slate-600">{application.company_name}</td>
                        <td className="px-6 py-4">
                          <select
                            value={application.statut}
                            onChange={(e) => handleStatusUpdate(application.id_candidature, e.target.value)}
                            disabled={isUpdating}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border-0 outline-none cursor-pointer appearance-none ${statusConfig.bg} ${statusConfig.text} transition-all hover:shadow-md disabled:opacity-50`}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="UNDER_REVIEW">Under Review</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(application.date_candidature).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDelete(application.id_candidature)}
                            disabled={isDeleting}
                            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-rose-100 hover:text-rose-600 transition-colors disabled:opacity-50 inline-flex"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default AdminApplications;