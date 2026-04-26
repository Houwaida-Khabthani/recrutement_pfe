import React, { useState } from 'react';
import { 
  useGetMyJobsQuery, 
  useCreateJobMutation, 
  useUpdateJobMutation, 
  useDeleteJobMutation 
} from '../../store/api/jobApi';
import { 
  Briefcase, 
  MapPin, 
  Eye, 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  MoreVertical,
  X,
  AlertCircle
} from 'lucide-react';

// --- UI COMPONENTS ---

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }) => {
  const styles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-red-50 text-red-700 border-red-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[variant]}`}>
      {children}
    </span>
  );
};

const CompanyJobs = () => {
  // API Hooks
  const { data: jobs = [], isLoading: jobsLoading } = useGetMyJobsQuery({});
  const [createJob, { isLoading: isCreating }] = useCreateJobMutation();
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();
  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    titre: '',
    type_contrat: 'CDI',
    localisation: '',
    description: '',
    salaire: '',
    experience: 'JUNIOR',
    date_expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    statut: 'OUVERT'
  });

  // Calculate Stats
  const stats = {
    active: jobs.filter((j: any) => j.statut === 'OUVERT' || j.statut === 'Active').length,
    views: jobs.reduce((acc: number, j: any) => acc + (j.nombre_vues || 0), 0),
    closed: jobs.filter((j: any) => j.statut === 'FERME').length,
  };

  // Filter Jobs
  const filteredJobs = jobs.filter((job: any) => {
    const matchesSearch = job.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.localisation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || job.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handlers
  const openAddModal = () => {
    setFormData({
      titre: '',
      type_contrat: 'CDI',
      localisation: '',
      description: '',
      salaire: '',
      experience: 'JUNIOR',
      date_expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      statut: 'OUVERT'
    });
    setModalType('add');
    setShowModal(true);
  };

  const openEditModal = (job: any) => {
    setSelectedJob(job);
    setFormData({
      titre: job.titre,
      type_contrat: job.type_contrat,
      localisation: job.localisation,
      description: job.description,
      salaire: job.salaire ? String(job.salaire) : '',
      experience: job.experience,
      date_expiration: job.date_expiration ? new Date(job.date_expiration).toISOString().split('T')[0] : '',
      statut: job.statut
    });
    setModalType('edit');
    setShowModal(true);
  };

  const openDeleteModal = (job: any) => {
    setSelectedJob(job);
    setModalType('delete');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Coerce types to match backend Joi validation
      const payload = {
        ...formData,
        // salaire must be a number or null (not a string)
        salaire: formData.salaire !== '' ? Number(formData.salaire) : null,
        // Ensure date_expiration is a valid ISO string or null
        date_expiration: formData.date_expiration || null,
      };
      if (modalType === 'add') {
        await createJob(payload).unwrap();
      } else if (modalType === 'edit') {
        await updateJob({ id: selectedJob.id_offre, ...payload }).unwrap();
      }
      setShowModal(false);
    } catch (err: any) {
      alert(err.data?.message || err.data?.error || 'Action failed. Check the form fields (title ≥5 chars, description ≥20 chars).');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteJob(selectedJob.id_offre).unwrap();
      setShowModal(false);
    } catch (err) {
      alert('Failed to delete job');
    }
  };

  if (jobsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold tracking-tighter">Loading job board stats...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 p-8 pt-4">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Job Postings</h1>
             <span className="bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded font-black tracking-widest uppercase">V3 LIVE</span>
          </div>
          <p className="text-slate-500 font-medium text-lg">Manage your recruitment pipeline and company presence.</p>
        </div>

        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-2xl shadow-slate-200 hover:-translate-y-1 hover:shadow-slate-300 active:scale-95 transition-all w-full lg:w-auto justify-center"
        >
          <Plus className="w-6 h-6 stroke-[3px]" />
          POST NEW JOB
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl hover:shadow-slate-100 transition-all cursor-default">
           <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase className="w-7 h-7" />
           </div>
           <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Active Offers</p>
              <h2 className="text-3xl font-black text-slate-900">{stats.active}</h2>
           </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl hover:shadow-slate-100 transition-all cursor-default">
           <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Eye className="w-7 h-7" />
           </div>
           <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Applications / Views</p>
              <h2 className="text-3xl font-black text-slate-900">{stats.views}</h2>
           </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl hover:shadow-slate-100 transition-all cursor-default">
           <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle className="w-7 h-7" />
           </div>
           <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Draft / Closed</p>
              <h2 className="text-3xl font-black text-slate-900">{stats.closed}</h2>
           </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-100/50 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 border border-slate-200/50 backdrop-blur-sm">
        <div className="relative flex-1 w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
           <input 
             type="text" 
             placeholder="Search by title, keywords or location..." 
             className="w-full bg-white border-transparent focus:border-slate-900 focus:ring-0 rounded-xl pl-12 pr-4 py-3 text-sm font-medium shadow-sm"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
           <select 
             className="bg-white border-transparent focus:border-slate-900 focus:ring-0 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 shadow-sm grow"
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
           >
             <option value="">All Statuses</option>
             <option value="OUVERT">Open</option>
             <option value="FERME">Closed</option>
           </select>
           <button className="p-3 bg-white border border-transparent rounded-xl shadow-sm text-slate-400 hover:text-slate-900 transition-colors">
             <Filter className="w-6 h-6" />
           </button>
        </div>
      </div>

      {/* Job Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
             <Briefcase className="w-16 h-16 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-400 text-lg font-bold italic">No matching job listings found.</p>
          </div>
        ) : (
          filteredJobs.map((job: any) => (
            <div key={job.id_offre} className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 flex flex-col group hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 overflow-hidden relative">
              
              <div className="p-7 flex-1">
                <div className="flex items-center justify-between mb-6">
                  <Badge variant={job.statut === 'OUVERT' ? 'success' : 'danger'}>
                    {job.statut}
                  </Badge>
                  <button className="text-slate-300 hover:text-slate-900 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{job.titre}</h3>
                
                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs mb-6 uppercase tracking-wider">
                   <MapPin className="w-4 h-4 text-blue-500" />
                   {job.localisation} • {job.type_contrat}
                </div>

                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 font-medium italic">
                  "{job.description}"
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                   <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Salary</p>
                      <p className="text-sm font-bold text-indigo-600">{job.salaire ? `${parseFloat(job.salaire).toLocaleString()} TND` : 'Negotiable'}</p>
                   </div>
                   <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Level</p>
                      <p className="text-sm font-bold text-indigo-600">{job.experience}</p>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                   <div className="flex items-center gap-4 text-slate-400">
                      <div className="flex items-center gap-1">
                         <Eye className="w-4 h-4 text-slate-300" />
                         <span className="text-xs font-bold">{job.nombre_vues}</span>
                      </div>
                      <div className="flex items-center gap-1">
                         <Calendar className="w-4 h-4 text-slate-300" />
                         <span className="text-xs font-bold">{new Date(job.date_pub).toLocaleDateString()}</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="flex p-2 bg-slate-50/50 border-t border-slate-100 gap-2">
                 <button 
                  onClick={() => openEditModal(job)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold text-xs hover:bg-slate-100 hover:border-slate-300 transition-all"
                 >
                   <Edit className="w-4 h-4" />
                   MODIFIER
                 </button>
                 <button 
                  onClick={() => openDeleteModal(job)}
                  className="px-4 py-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all group/btn"
                 >
                   <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                 </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- PREMIUM MODALS --- */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-900/60 transition-all animate-in fade-in duration-300">
           
           <div className={`bg-white rounded-[40px] shadow-2xl relative overflow-hidden transition-all duration-500 scale-100 ${modalType === 'delete' ? 'max-w-md w-full' : 'max-w-3xl w-full'}`}>
              
              {/* Modal Header */}
              <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-100 mb-6">
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
                       {modalType === 'add' && 'Create New Job Listing'}
                       {modalType === 'edit' && 'Modify Job Posting'}
                       {modalType === 'delete' && 'Verify Deletion'}
                    </h2>
                    <p className="text-slate-400 text-sm font-medium">
                       {modalType === 'add' && 'Publish a new position on the platform'}
                       {modalType === 'edit' && 'Update existing position requirements'}
                       {modalType === 'delete' && 'This action cannot be undone'}
                    </p>
                 </div>
                 <button 
                   onClick={() => setShowModal(false)}
                   className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                 >
                    <X className="w-6 h-6" />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 pt-0 max-h-[70vh] overflow-y-auto">
                 {modalType === 'delete' ? (
                   <div className="text-center space-y-6 py-4">
                      <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto animate-bounce">
                         <Trash2 className="w-10 h-10" />
                      </div>
                      <p className="text-slate-600 font-medium">
                        Are you sure you want to delete the position <span className="font-black text-slate-900">"{selectedJob?.titre}"</span>? All candidates linked to this offer will lose access.
                      </p>
                      <div className="flex gap-4">
                         <button 
                           onClick={() => setShowModal(false)}
                           className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
                         >
                           Cancel
                         </button>
                         <button 
                           onClick={handleDelete}
                           disabled={isDeleting}
                           className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-200 hover:bg-red-700 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                         >
                           {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                         </button>
                      </div>
                   </div>
                 ) : (
                   <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Job Title*</label>
                            <input 
                              required
                              type="text" 
                              className="w-full bg-slate-50 border-transparent focus:border-slate-900 focus:ring-0 rounded-2xl px-5 py-4 text-sm font-bold"
                              placeholder="e.g. Senior Product Designer"
                              value={formData.titre}
                              onChange={(e) => setFormData({...formData, titre: e.target.value})}
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Location / Office*</label>
                            <input 
                              required
                              type="text" 
                              className="w-full bg-slate-50 border-transparent focus:border-slate-900 focus:ring-0 rounded-2xl px-5 py-4 text-sm font-bold"
                              placeholder="e.g. Remote, Tunis, BEJA"
                              value={formData.localisation}
                              onChange={(e) => setFormData({...formData, localisation: e.target.value})}
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contract Type</label>
                            <select 
                              className="w-full bg-slate-50 border-transparent focus:border-slate-900 focus:ring-0 rounded-2xl px-5 py-4 text-sm font-bold"
                              value={formData.type_contrat}
                              onChange={(e) => setFormData({...formData, type_contrat: e.target.value})}
                            >
                               <option value="CDI">Full-time (CDI)</option>
                               <option value="CDD">Fixed-term (CDD)</option>
                               <option value="CIVP">CIVP</option>
                               <option value="FREELANCE">Freelance</option>
                               <option value="INTERN">Internship</option>
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Salary Range (Monthly)</label>
                            <input 
                              type="number" 
                              className="w-full bg-slate-50 border-transparent focus:border-slate-900 focus:ring-0 rounded-2xl px-5 py-4 text-sm font-bold"
                              placeholder="e.g. 2500"
                              value={formData.salaire}
                              onChange={(e) => setFormData({...formData, salaire: e.target.value})}
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Experience Required</label>
                            <select 
                              className="w-full bg-slate-50 border-transparent focus:border-slate-900 focus:ring-0 rounded-2xl px-5 py-4 text-sm font-bold"
                              value={formData.experience}
                              onChange={(e) => setFormData({...formData, experience: e.target.value})}
                            >
                               <option value="JUNIOR">Junior (0-2 years)</option>
                               <option value="INTERMEDIATE">Intermediate (2-5 years)</option>
                               <option value="SENIOR">Senior (5+ years)</option>
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                            <input 
                              type="date" 
                              className="w-full bg-slate-50 border-transparent focus:border-slate-900 focus:ring-0 rounded-2xl px-5 py-4 text-sm font-bold"
                              value={formData.date_expiration}
                              onChange={(e) => setFormData({...formData, date_expiration: e.target.value})}
                            />
                         </div>
                         {modalType === 'edit' && (
                            <div className="space-y-2">
                               <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Offer Status</label>
                               <select 
                                 className="w-full bg-slate-50 border-transparent focus:border-slate-900 focus:ring-0 rounded-2xl px-5 py-4 text-sm font-bold"
                                 value={formData.statut}
                                 onChange={(e) => setFormData({...formData, statut: e.target.value})}
                               >
                                  <option value="OUVERT">Active (Open)</option>
                                  <option value="FERME">Closed</option>
                               </select>
                            </div>
                         )}
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Job Description & Requirements*</label>
                         <textarea 
                           required
                           rows={5}
                           className="w-full bg-slate-50 border-transparent focus:border-slate-900 focus:ring-0 rounded-3xl px-6 py-5 text-sm font-medium leading-relaxed italic"
                           placeholder="Describe the role, responsibilities and technical stack..."
                           value={formData.description}
                           onChange={(e) => setFormData({...formData, description: e.target.value})}
                         />
                      </div>
                      <div className="pt-6">
                         <button 
                           type="submit"
                           disabled={isCreating || isUpdating}
                           className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl shadow-2xl shadow-slate-200 hover:-translate-y-1 hover:shadow-slate-400 transition-all uppercase tracking-[4px] text-sm disabled:opacity-50"
                         >
                            {isCreating || isUpdating ? 'Processing Cloud Sync...' : modalType === 'add' ? 'Publish Listing' : 'Save Changes'}
                         </button>
                      </div>
                   </form>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CompanyJobs;