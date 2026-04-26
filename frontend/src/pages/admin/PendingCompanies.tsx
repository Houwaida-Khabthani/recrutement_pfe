import { useState } from 'react';
import {
  Building2, CheckCircle, XCircle, Search, AlertCircle, Mail, Globe, MapPin, Sparkles
} from 'lucide-react';
import { 
  useGetAllCompaniesQuery, 
  useApproveCompanyMutation, 
  useRejectCompanyMutation 
} from "../../store/api/adminApi";

function PendingCompanies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // 'all', 'pending', 'approved', 'rejected'
  const [rejectReason, setRejectReason] = useState<{ [key: number]: string }>({});
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null);

  // Get all companies (no status filter, or with specific status)
  const { data: companies, isLoading, isError, refetch } = useGetAllCompaniesQuery({
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter
  });

  const [approveCompany, { isLoading: isApproving }] = useApproveCompanyMutation();
  const [rejectCompany, { isLoading: isRejecting }] = useRejectCompanyMutation();

  const handleApprove = async (companyId: number) => {
    try {
      await approveCompany(companyId).unwrap();
      alert('✅ Company approved successfully!');
      refetch();
    } catch (error: any) {
      console.error('Approval error:', error);
      const errorMsg = error?.data?.message || error?.data?.error || error?.message || 'Unknown error';
      alert('❌ Error approving company:\n' + errorMsg);
    }
  };

  const handleRejectSubmit = async (companyId: number) => {
    const reason = rejectReason[companyId] || '';
    
    if (!reason.trim()) {
      alert('⚠️ Please provide a rejection reason');
      return;
    }
    
    try {
      await rejectCompany({ id: companyId, reason }).unwrap();
      alert('✅ Company rejected successfully!');
      setShowRejectModal(null);
      setRejectReason({ ...rejectReason, [companyId]: '' });
      refetch();
    } catch (error: any) {
      console.error('Full rejection error object:', error);
      
      let errorMsg = 'Unknown error';
      
      // Handle RTK Query error formats
      if (error?.data) {
        if (typeof error.data === 'string') {
          // If data is HTML or plain string
          if (error.data.includes('<!DOCTYPE')) {
            errorMsg = 'Server error: Invalid response format';
          } else {
            errorMsg = error.data;
          }
        } else if (typeof error.data === 'object') {
          // If data is JSON object
          errorMsg = error.data.message || error.data.error || JSON.stringify(error.data);
        }
      } else if (error?.message) {
        errorMsg = error.message;
      } else if (error?.status) {
        errorMsg = `Server error: ${error.status}`;
      }
      
      alert('❌ Error rejecting company:\n' + errorMsg);
    }
  };

  return (
    <>
      

      <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <p className="text-indigo-600 text-[11px] font-black uppercase tracking-[4px] mb-1 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Company Approval
            </p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
              Pending Companies ⏳
            </h1>
            <p className="text-slate-500 font-medium text-base">
              Review and approve or reject new company registrations
            </p>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search companies by name or email..."
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
            />
          </div>
        </div>

        {/* ── Status Filter ── */}
        <div className="flex gap-3 flex-wrap">
          {[
            { value: 'all', label: 'All Companies', color: 'indigo' },
            { value: 'pending', label: '⏳ Pending', color: 'yellow' },
            { value: 'approved', label: '✓ Approved', color: 'emerald' },
            { value: 'rejected', label: '✗ Rejected', color: 'rose' }
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-6 py-2.5 font-bold rounded-full transition-all ${
                statusFilter === filter.value
                  ? `bg-${filter.color}-100 text-${filter.color}-700 ring-2 ring-${filter.color}-500`
                  : `bg-slate-100 text-slate-600 hover:bg-slate-200`
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* ── Companies Table ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {isLoading && (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-slate-500 font-medium">Loading pending companies...</p>
            </div>
          )}

          {isError && (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
              <p className="text-rose-600 font-medium">Error loading companies</p>
            </div>
          )}

          {!isLoading && companies?.length === 0 && (
            <div className="p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">
                {statusFilter === 'all' ? 'No companies found' : `No ${statusFilter} companies found`}
              </p>
            </div>
          )}

          {!isLoading && companies && companies.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Company</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Email</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Industry</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Country</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Status</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Description</th>
                    <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-widest text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companies.map((company: any) => (
                    <tr key={company.id_company} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                            {company.nom?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{company.nom}</p>
                            <p className="text-xs text-slate-400">{company.user_name || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a href={`mailto:${company.email}`} className="text-indigo-600 hover:underline font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4" /> {company.email}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {company.secteur || '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex items-center gap-2">
                          {company.pays ? (
                            <>
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span>{company.pays}</span>
                            </>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {company.status === 'pending' && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">⏳ Pending</span>
                          )}
                          {company.status === 'approved' && (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">✓ Approved</span>
                          )}
                          {company.status === 'rejected' && (
                            <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">✗ Rejected</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={company.description}>
                        {company.description || '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {company.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleApprove(company.id_company)}
                              disabled={isApproving}
                              className="p-2 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShowRejectModal(company.id_company)}
                              disabled={isRejecting}
                              className="p-2 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── Reject Modal ── */}
      {showRejectModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-rose-600 to-rose-700 px-8 py-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Reject Company</h3>
            </div>

            <div className="p-8 space-y-4">
              <p className="text-slate-600">
                Are you sure you want to reject this company? Please provide a reason for rejection.
              </p>
              
              <textarea
                value={rejectReason[showRejectModal] || ''}
                onChange={(e) => setRejectReason({ ...rejectReason, [showRejectModal]: e.target.value })}
                placeholder="Enter rejection reason (e.g., Invalid documents, Incomplete information)..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition resize-none"
                rows={4}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowRejectModal(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectSubmit(showRejectModal)}
                  disabled={isRejecting}
                  className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 disabled:opacity-50 transition"
                >
                  {isRejecting ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PendingCompanies;
