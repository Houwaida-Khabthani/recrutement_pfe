import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, User, Briefcase } from 'lucide-react';
import { useGetJobByIdQuery } from '../../store/api/adminApi';
import StatusBadge from '../../components/admin/StatusBadge';

const AdminJobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const jobId = Number(id);
  const { data: job, isLoading, isError, isFetching } = useGetJobByIdQuery(jobId, {
    skip: !jobId,
    refetchOnMountOrArgChange: true,
  });

  const title = job?.titre || job?.title || 'Job details';
  const companyName = job?.company_name || job?.nom_entreprise || 'Unknown company';
  const recruiterName = job?.recruiter_name || job?.nom_recruteur || 'Unknown recruiter';
  const location = job?.localisation || job?.location || 'Unknown location';
  const status = (job?.status || job?.statut || 'PENDING').toString().toUpperCase();
  const createdAt = job?.created_at || job?.createdAt || job?.updated_at || '';
  const description = job?.description || job?.desc || 'No description available.';

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="ml-0 md:ml-64 p-6 lg:p-8 max-w-7xl">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[3px] text-slate-400">Job Moderation</p>
                <h1 className="mt-2 text-3xl font-black text-slate-900">{title}</h1>
                <p className="text-sm text-slate-500">Detailed audit information for this job listing.</p>
              </div>
              <Link
                to="/admin/jobs"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to moderation
              </Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
              <section className="space-y-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={status} />
                  <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[2px] text-slate-500">
                    ID: {jobId || 'n/a'}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500">
                      <Briefcase className="h-5 w-5" />
                      <p className="font-semibold text-slate-900">Company</p>
                    </div>
                    <p className="mt-3 text-slate-700">{companyName}</p>
                  </div>
                  <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500">
                      <User className="h-5 w-5" />
                      <p className="font-semibold text-slate-900">Recruiter</p>
                    </div>
                    <p className="mt-3 text-slate-700">{recruiterName}</p>
                  </div>
                  <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500">
                      <MapPin className="h-5 w-5" />
                      <p className="font-semibold text-slate-900">Location</p>
                    </div>
                    <p className="mt-3 text-slate-700">{location}</p>
                  </div>
                  <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500">
                      <Clock className="h-5 w-5" />
                      <p className="font-semibold text-slate-900">Created</p>
                    </div>
                    <p className="mt-3 text-slate-700">{createdAt ? new Date(createdAt).toLocaleString() : 'Unknown'}</p>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900">Job description</h2>
                  <p className="mt-4 whitespace-pre-line text-slate-600">{description}</p>
                </div>
              </section>

              <aside className="space-y-4">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm uppercase tracking-[2px] text-slate-400">Audit log</p>
                  <div className="mt-4 space-y-3 text-slate-700">
                    <p className="text-sm"><span className="font-semibold">Last status:</span> {status}</p>
                    <p className="text-sm"><span className="font-semibold">Changed by:</span> {job?.last_status_by || 'System'}</p>
                    <p className="text-sm"><span className="font-semibold">Updated:</span> {job?.last_status_at ? new Date(job.last_status_at).toLocaleString() : 'Unknown'}</p>
                  </div>
                </div>
                <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Quick notes</p>
                  <p className="mt-3">Use this view to review flagged jobs and verify recruiter details before changing a status.</p>
                </div>
              </aside>
            </div>
          </div>

          {(isLoading || isFetching) && (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center text-slate-600">Loading job details…</div>
          )}

          {isError && (
            <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-10 text-center text-rose-700">Failed to load job details. Please try again.</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminJobDetails;
