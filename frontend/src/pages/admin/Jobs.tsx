import { useState } from 'react';
import {
  Briefcase, Plus, Search, Edit2, Trash2, X, AlertCircle,
  MapPin, DollarSign, Sparkles
} from 'lucide-react';
import Sidebar from "../../components/common/Sidebar";
import Navbar from "../../components/common/Navbar";
import { useGetAllJobsQuery, useDeleteJobMutation, useCreateJobMutation, useUpdateJobMutation } from "../../store/api/adminApi";

function AdminJobs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    localisation: '',
    salaire_min: '',
    salaire_max: '',
    type_contrat: 'CDI',
    niveau_experience: 'Junior',
    id_company: ''
  });

  const { data: jobs, isLoading, isError, refetch } = useGetAllJobsQuery({
    search: searchTerm
  });
  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation();
  const [createJob, { isLoading: isCreating }] = useCreateJobMutation();
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await deleteJob(id).unwrap();
        refetch();
        alert("Job deleted successfully");
      } catch (err: any) {
        alert(err.data?.message || "Error deleting job");
      }
    }
  };

  const openForm = (job?: any) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        titre: job.titre || '',
        description: job.description || '',
        localisation: job.localisation || '',
        salaire_min: job.salaire_min || '',
        salaire_max: job.salaire_max || '',
        type_contrat: job.type_contrat || 'CDI',
        niveau_experience: job.niveau_experience || 'Junior',
        id_company: job.id_company || ''
      });
    } else {
      setEditingJob(null);
      setFormData({
        titre: '',
        description: '',
        localisation: '',
        salaire_min: '',
        salaire_max: '',
        type_contrat: 'CDI',
        niveau_experience: 'Junior',
        id_company: ''
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingJob(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await updateJob({ id: editingJob.id_offre, ...formData }).unwrap();
        alert("Job updated successfully");
      } else {
        await createJob(formData).unwrap();
        alert("Job created successfully");
      }
      closeForm();
      refetch();
    } catch (err: any) {
      alert(err.data?.message || "Error saving job");
    }
  };

  return (
    <>
      <Sidebar />
      <Navbar />

      <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <p className="text-indigo-600 text-[11px] font-black uppercase tracking-[4px] mb-1 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Job Management
            </p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
              Manage Job Listings 💼
            </h1>
            <p className="text-slate-500 font-medium text-base">
              Create, edit, and manage all job postings on the platform
            </p>
          </div>
          <button
            onClick={() => openForm()}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 w-fit"
          >
            <Plus className="w-5 h-5" />
            Add Job
          </button>
        </div>

        {/* ── Search ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, location, or company..."
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
            />
          </div>
        </div>

        {/* ── Jobs Table ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {isLoading && (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-slate-500 font-medium">Loading jobs...</p>
            </div>
          )}

          {isError && (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
              <p className="text-rose-600 font-medium">Error loading jobs</p>
            </div>
          )}

          {!isLoading && jobs?.length === 0 && (
            <div className="p-12 text-center">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No jobs found</p>
            </div>
          )}

          {!isLoading && jobs && jobs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Job Title</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Location</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Contract Type</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Salary Range</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Experience</th>
                    <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-widest text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs.map((job: any) => (
                    <tr key={job.id_offre} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{job.titre}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {job.localisation}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg">
                          {job.type_contrat}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                          <DollarSign className="w-4 h-4 text-emerald-500" />
                          {job.salaire_min && job.salaire_max
                            ? `${job.salaire_min} - ${job.salaire_max}`
                            : job.salaire_min || job.salaire_max || 'Not specified'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{job.niveau_experience}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openForm(job)}
                            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(job.id_offre)}
                            disabled={isDeleting}
                            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-rose-100 hover:text-rose-600 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── Modal for Create/Edit Job ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                {editingJob ? '✏️ Edit Job' : '➕ Create New Job'}
              </h3>
              <button onClick={closeForm} className="p-1 hover:bg-white/20 rounded-lg transition">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Job Title *</label>
                  <input
                    type="text"
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                    required
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Location *</label>
                  <input
                    type="text"
                    value={formData.localisation}
                    onChange={(e) => setFormData({ ...formData, localisation: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                    required
                  />
                </div>

                {/* Contract Type */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Contract Type</label>
                  <select
                    value={formData.type_contrat}
                    onChange={(e) => setFormData({ ...formData, type_contrat: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition appearance-none cursor-pointer"
                  >
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                {/* Min Salary */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Min Salary</label>
                  <input
                    type="number"
                    value={formData.salaire_min}
                    onChange={(e) => setFormData({ ...formData, salaire_min: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                  />
                </div>

                {/* Max Salary */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Max Salary</label>
                  <input
                    type="number"
                    value={formData.salaire_max}
                    onChange={(e) => setFormData({ ...formData, salaire_max: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                  />
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Experience Level</label>
                  <select
                    value={formData.niveau_experience}
                    onChange={(e) => setFormData({ ...formData, niveau_experience: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition appearance-none cursor-pointer"
                  >
                    <option value="Débutant">Débutant</option>
                    <option value="Junior">Junior</option>
                    <option value="Confirmé">Confirmé</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition resize-none"
                    rows={6}
                    required
                  ></textarea>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-6 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition flex items-center gap-2"
                >
                  {isCreating || isUpdating ? 'Saving...' : (editingJob ? '💾 Update' : '✨ Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminJobs;
