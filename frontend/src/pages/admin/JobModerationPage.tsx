import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Search, XCircle } from 'lucide-react';
import { useGetAllJobsQuery, useApproveJobMutation, useRejectJobMutation, useSuspendJobMutation } from '../../store/api/adminApi';
import JobModerationTable from '../../components/admin/JobModerationTable';
import ConfirmActionModal from '../../components/admin/ConfirmActionModal';
import StatusBadge from '../../components/admin/StatusBadge';

type JobModerationJob = {
  id?: number;
  id_offre?: number;
  titre?: string;
  company_name?: string;
  nom_entreprise?: string;
  recruiter_name?: string;
  nom_recruteur?: string;
  localisation?: string;
  location?: string;
  status?: string;
  statut?: string;
  created_at?: string;
  createdAt?: string;
  last_status_by?: string;
  last_status_at?: string;
  updated_at?: string;
};

type ActionType = 'approve' | 'reject' | 'suspend';

type ConfirmState = {
  action: ActionType;
  jobIds: number[];
  label: string;
  message: string;
};

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
];

const normalizeJobId = (job: JobModerationJob) => job.id ?? job.id_offre ?? 0;

const JobModerationPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const limit = 12;
  const cleanSearch = searchTerm.trim() || undefined;
  const queryParams = {
    search: cleanSearch,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    limit,
  };

  const { data, isLoading, isError, isFetching, refetch } = useGetAllJobsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [approveJob, { isLoading: isApproving }] = useApproveJobMutation();
  const [rejectJob, { isLoading: isRejecting }] = useRejectJobMutation();
  const [suspendJob, { isLoading: isSuspending }] = useSuspendJobMutation();

  const jobs = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as JobModerationJob[];
    return (data as any).jobs || (data as any).data || [];
  }, [data]);

  const totalCount = (data && typeof data === 'object' ? (data as any).total ?? (data as any).totalCount : undefined) as number | undefined;
  const totalPages = totalCount ? Math.max(1, Math.ceil(totalCount / limit)) : Math.max(1, page + (jobs.length === limit ? 1 : 0));

  const clearToast = () => setToastMessage('');
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    window.setTimeout(clearToast, 3000);
  };

  const handleSelectToggle = (jobId: number) => {
    setSelectedIds((current) =>
      current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId],
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? jobs.map(normalizeJobId).filter(Boolean) : []);
  };

  const handleNavigateToDetails = (jobId: number) => {
    navigate(`/admin/jobs/${jobId}`);
  };

  const createConfirm = (jobIds: number[], action: ActionType) => {
    const label = action === 'approve' ? 'Approve' : action === 'reject' ? 'Reject' : 'Suspend';
    const message = `Are you sure you want to ${label.toLowerCase()} ${jobIds.length === 1 ? 'this job' : 'these jobs'}?`;
    setConfirmState({ action, jobIds, label, message });
  };

  const handleAction = async (jobIds: number[], action: ActionType) => {
    try {
      const mutation = action === 'approve' ? approveJob : action === 'reject' ? rejectJob : suspendJob;
      await Promise.all(jobIds.map((id) => mutation(id).unwrap()));
      setSelectedIds((current) => current.filter((id) => !jobIds.includes(id)));
      showToast(`Job${jobIds.length > 1 ? 's' : ''} ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'suspended'} successfully.`, 'success');
      refetch();
    } catch (err: any) {
      const message = err.data?.message || err.message || 'Action failed. Please try again.';
      showToast(message, 'error');
    } finally {
      setConfirmState(null);
    }
  };

  const renderSubheading = (job: JobModerationJob) => {
    if (!job.last_status_by && !job.last_status_at) return null;
    return (
      <p className="text-[11px] text-slate-400 mt-1">
        Updated by {job.last_status_by || 'system'}
        {job.last_status_at ? ` · ${new Date(job.last_status_at).toLocaleString()}` : ''}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="ml-0 md:ml-64 p-6 lg:p-8 max-w-8xl">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-indigo-600 text-xs font-black uppercase tracking-[4px] mb-2">Admin / Jobs Moderation</p>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Job Moderation</h1>
                <p className="mt-2 text-slate-500 max-w-2xl">
                  Review all job offers, filter by status, and approve, reject, or suspend listings from the admin dashboard.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => createConfirm(selectedIds.length ? selectedIds : [], 'approve')}
                  disabled={selectedIds.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve selected
                </button>
                <button
                  type="button"
                  onClick={() => createConfirm(selectedIds.length ? selectedIds : [], 'reject')}
                  disabled={selectedIds.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <XCircle className="w-4 h-4" />
                  Reject selected
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="grid gap-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative w-full sm:w-auto flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by job title or company"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {isLoading || isFetching ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                    <p className="text-sm font-semibold text-slate-600">Loading job offers...</p>
                  </div>
                ) : isError ? (
                  <div className="rounded-3xl border border-rose-200 bg-rose-50 p-10 text-center">
                    <p className="text-sm font-semibold text-rose-700">Unable to load jobs. Please refresh the page.</p>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center">
                    <p className="text-sm font-semibold text-slate-600">No jobs match your filter. Try another search or status.</p>
                  </div>
                ) : (
                  <JobModerationTable
                    jobs={jobs}
                    selectedIds={selectedIds}
                    onSelect={handleSelectToggle}
                    onSelectAll={handleSelectAll}
                    onView={handleNavigateToDetails}
                    onAction={(job, action) => createConfirm([normalizeJobId(job)], action)}
                    renderSubheading={renderSubheading}
                  />
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">Showing {jobs.length} job{jobs.length > 1 ? 's' : ''}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={page === 1}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm font-medium text-slate-600">Page {page}</span>
                    <button
                      type="button"
                      onClick={() => setPage((current) => current + 1)}
                      disabled={jobs.length < limit && (!totalCount || page >= totalPages)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[2px] text-slate-400">Audit Quick Actions</p>
                    <h2 className="mt-2 text-xl font-black text-slate-900">Action center</h2>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-500">Selected jobs</p>
                    <p className="mt-2 text-3xl font-black text-slate-900">{selectedIds.length}</p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-600">Current filter</p>
                    <p className="mt-2 text-slate-500">{statusOptions.find((option) => option.value === statusFilter)?.label}</p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-600">Status legend</p>
                    <div className="mt-4 grid gap-3">
                      <StatusBadge status="PENDING" />
                      <StatusBadge status="APPROVED" />
                      <StatusBadge status="REJECTED" />
                      <StatusBadge status="SUSPENDED" />
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </section>

          {toastMessage && (
            <div className={`fixed bottom-6 right-6 z-50 rounded-3xl border px-5 py-4 shadow-xl transition ${toastType === 'success' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-rose-600 text-white border-rose-700'}`}>
              <p className="text-sm font-semibold">{toastMessage}</p>
            </div>
          )}
        </div>
      </main>

      {confirmState && (
        <ConfirmActionModal
          title={`${confirmState.label} Job${confirmState.jobIds.length > 1 ? 's' : ''}`}
          message={confirmState.message}
          actionLabel={confirmState.label}
          actionType={confirmState.action}
          loading={isApproving || isRejecting || isSuspending}
          onCancel={() => setConfirmState(null)}
          onConfirm={() => handleAction(confirmState.jobIds, confirmState.action)}
        />
      )}
    </div>
  );
};

export default JobModerationPage;
