import { CheckCircle, Eye, PauseCircle, XCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import type { ReactNode } from 'react';

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
};

type JobModerationRowProps = {
  job: JobModerationJob;
  selected: boolean;
  onSelect: (id: number) => void;
  onAction: (job: JobModerationJob, action: 'approve' | 'reject' | 'suspend') => void;
  onView: (id: number) => void;
  renderSubheading?: (job: JobModerationJob) => ReactNode;
};

const getJobId = (job: JobModerationJob) => job.id ?? job.id_offre ?? 0;

const JobModerationRow = ({ job, selected, onSelect, onAction, onView, renderSubheading }: JobModerationRowProps) => {
  const id = getJobId(job);
  const title = job.titre || 'Untitled job';
  const companyName = job.company_name || job.nom_entreprise || 'Unknown company';
  const recruiterName = job.recruiter_name || job.nom_recruteur || 'Unknown recruiter';
  const location = job.localisation || job.location || 'Unknown location';
  const status = (job.status || job.statut || 'PENDING').toString().toUpperCase();
  const createdAt = job.created_at || job.createdAt || job.last_status_at || '';

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="whitespace-nowrap px-4 py-4">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(id)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
        </label>
      </td>
      <td className="min-w-[180px] px-4 py-4">
        <div className="font-semibold text-slate-900">{title}</div>
        <div className="text-xs text-slate-500 mt-1">{companyName}</div>
        {renderSubheading?.(job)}
      </td>
      <td className="px-4 py-4 text-slate-600">{recruiterName}</td>
      <td className="px-4 py-4 text-slate-600">{location}</td>
      <td className="px-4 py-4">
        <StatusBadge status={status} />
      </td>
      <td className="px-4 py-4 text-slate-600">{createdAt ? new Date(createdAt).toLocaleDateString() : 'Unknown'}</td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() => onAction(job, 'approve')}
            className="inline-flex items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 p-2 text-emerald-600 transition hover:bg-emerald-100"
            title="Approve"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onAction(job, 'reject')}
            className="inline-flex items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100"
            title="Reject"
          >
            <XCircle className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onAction(job, 'suspend')}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100"
            title="Suspend"
          >
            <PauseCircle className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onView(id)}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-100 bg-white p-2 text-slate-600 transition hover:bg-slate-50"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default JobModerationRow;
