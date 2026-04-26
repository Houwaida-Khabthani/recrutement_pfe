import type { ReactNode } from 'react';
import JobModerationRow from './JobModerationRow';

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
};

type JobModerationTableProps = {
  jobs: JobModerationJob[];
  selectedIds: number[];
  onSelect: (jobId: number) => void;
  onSelectAll: (checked: boolean) => void;
  onAction: (job: JobModerationJob, action: 'approve' | 'reject' | 'suspend') => void;
  onView: (jobId: number) => void;
  renderSubheading?: (job: JobModerationJob) => ReactNode;
};

const getJobId = (job: JobModerationJob) => job.id ?? job.id_offre ?? 0;

const JobModerationTable = ({ jobs, selectedIds, onSelect, onSelectAll, onAction, onView, renderSubheading }: JobModerationTableProps) => {
  const allSelected = jobs.length > 0 && jobs.every((job) => selectedIds.includes(getJobId(job)));

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-4">
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              </th>
              <th className="px-4 py-4 font-semibold uppercase tracking-[1px]">Job</th>
              <th className="px-4 py-4 font-semibold uppercase tracking-[1px]">Recruiter</th>
              <th className="px-4 py-4 font-semibold uppercase tracking-[1px]">Location</th>
              <th className="px-4 py-4 font-semibold uppercase tracking-[1px]">Status</th>
              <th className="px-4 py-4 font-semibold uppercase tracking-[1px]">Created</th>
              <th className="px-4 py-4 font-semibold uppercase tracking-[1px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {jobs.map((job) => (
              <JobModerationRow
                key={getJobId(job)}
                job={job}
                selected={selectedIds.includes(getJobId(job))}
                onSelect={onSelect}
                onAction={onAction}
                onView={onView}
                renderSubheading={renderSubheading}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobModerationTable;
