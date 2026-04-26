import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Filter, DollarSign, Clock, ChevronRight, Star, X } from 'lucide-react';
import { useGetJobsQuery } from '../../store/api/jobApi';

const contractColors: Record<string, string> = {
  CDI: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  CDD: 'bg-amber-50 text-amber-600 border-amber-100',
  Freelance: 'bg-violet-50 text-violet-600 border-violet-100',
  Stage: 'bg-sky-50 text-sky-600 border-sky-100',
};

const CandidateJobs = () => {
  const navigate = useNavigate();
  const { data: jobs = [], isLoading } = useGetJobsQuery(undefined);

  const [search, setSearch] = useState('');
  const [contractFilter, setContractFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = (Array.isArray(jobs) ? jobs : []).filter((job: any) => {
    const q = search.toLowerCase();
    const matchSearch = !q || job.titre?.toLowerCase().includes(q) || job.localisation?.toLowerCase().includes(q) || job.description?.toLowerCase().includes(q);
    const matchContract = !contractFilter || job.type_contrat === contractFilter;
    const matchLocation = !locationFilter || job.localisation?.toLowerCase().includes(locationFilter.toLowerCase());
    return matchSearch && matchContract && matchLocation;
  });

  const contracts = [...new Set((Array.isArray(jobs) ? jobs : []).map((j: any) => j.type_contrat).filter(Boolean))];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-indigo-600 text-[11px] font-black uppercase tracking-[4px] mb-1">Opportunities</p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Browse Job Offers</h1>
          <p className="text-slate-400 font-medium text-base mt-1">Find your next role from {Array.isArray(jobs) ? jobs.length : 0} available positions.</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold text-sm shadow-sm hover:border-indigo-200 hover:text-indigo-600 transition-all"
        >
          <Filter className="w-4 h-4" />
          Filters {(contractFilter || locationFilter) && <span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-[9px] flex items-center justify-center font-black">!</span>}
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          <input
            type="text"
            placeholder="Search jobs by title, location, keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 transition-all outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contract Type</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setContractFilter('')}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border tracking-widest transition-all ${!contractFilter ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-200'}`}
                >
                  All
                </button>
                {contracts.map((c: string) => (
                  <button
                    key={c}
                    onClick={() => setContractFilter(c === contractFilter ? '' : c)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border tracking-widest transition-all ${contractFilter === c ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-200'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  type="text"
                  placeholder="Filter by city..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Results count ── */}
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm font-bold">
          Showing <span className="text-slate-900 font-black">{filtered.length}</span> {filtered.length === 1 ? 'result' : 'results'}
          {search && <> for "<span className="text-indigo-600">{search}</span>"</>}
        </p>
      </div>

      {/* ── Jobs Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 animate-pulse">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl mb-4" />
              <div className="h-4 bg-slate-100 rounded-full mb-2 w-3/4" />
              <div className="h-3 bg-slate-100 rounded-full mb-4 w-1/2" />
              <div className="flex gap-2">
                <div className="h-6 bg-slate-100 rounded-lg w-16" />
                <div className="h-6 bg-slate-100 rounded-lg w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-[30px] flex items-center justify-center mx-auto mb-5">
            <Briefcase className="w-10 h-10 text-slate-300" />
          </div>
          <p className="text-slate-400 font-black text-lg mb-2">No jobs found</p>
          <p className="text-slate-300 text-sm mb-6">Try adjusting your filters or search terms.</p>
          <button
            onClick={() => { setSearch(''); setContractFilter(''); setLocationFilter(''); }}
            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl text-sm hover:-translate-y-0.5 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((job: any) => {
            const contractClass = contractColors[job.type_contrat] || 'bg-slate-50 text-slate-500 border-slate-100';
            const isNew = job.statut === 'OUVERT' || job.statut === 'Active';

            return (
              <div
                key={job.id_offre}
                onClick={() => navigate(`/candidate/jobs/${job.id_offre}`)}
                className="bg-white border border-slate-100 rounded-3xl p-6 cursor-pointer hover:shadow-2xl hover:shadow-slate-100 hover:-translate-y-2 transition-all duration-300 group flex flex-col"
              >
                {/* Job header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform shadow-xl shadow-slate-200">
                    {job.titre?.[0]?.toUpperCase() || 'J'}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isNew && (
                      <span className="flex items-center gap-1 text-amber-500 text-[9px] font-black uppercase tracking-widest">
                        <Star className="w-3 h-3 fill-amber-400" /> Open
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase border tracking-widest ${contractClass}`}>
                      {job.type_contrat || 'CDI'}
                    </span>
                  </div>
                </div>

                {/* Title & location */}
                <h3 className="font-black text-slate-900 text-base mb-1 group-hover:text-indigo-600 transition-colors">{job.titre}</h3>
                <p className="text-slate-400 text-[11px] font-bold flex items-center gap-1 mb-4">
                  <MapPin className="w-3 h-3 text-slate-300" />{job.localisation || 'Remote'}
                </p>

                {/* Description snippet */}
                <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2 mb-5 flex-1">
                  {job.description || 'No description available.'}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex gap-2 items-center text-slate-400">
                    {job.salaire && (
                      <span className="flex items-center gap-1 text-xs font-black text-slate-500">
                        <DollarSign className="w-3 h-3" />{job.salaire} TND
                      </span>
                    )}
                    {job.experience && (
                      <span className="flex items-center gap-1 text-xs font-black text-slate-500">
                        <Clock className="w-3 h-3" />{job.experience}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-indigo-600 text-[10px] font-black uppercase tracking-widest group-hover:gap-2 transition-all">
                    Apply <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CandidateJobs;