import React, { useState } from 'react';
import { 
  useGetCompanyApplicationsQuery, 
  useUpdateApplicationStatusMutation, 
  useDeleteApplicationMutation 
} from "../../store/api/applicationApi";
import { 
  useSetExpectedInterviewsMutation,
  useScheduleInterviewMutation,
} from "../../store/api/interviewApi";
import { 
  Search, 
  Filter, 
  Trash2, 
  ChevronDown, 
  Mail,
  Download,
  CalendarDays,
  Plus,
} from 'lucide-react';
import ScheduleInterviewModal from '../../components/modals/ScheduleInterviewModal';

const CompanyApplicationsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [selectedStep, setSelectedStep] = useState<number>(1);

  const { data: applications = [], isLoading, refetch } = useGetCompanyApplicationsQuery({
    search: searchTerm
  });
  
  const [updateApplicationStatus, { isLoading: isUpdating }] = useUpdateApplicationStatusMutation();
  const [deleteApplication, { isLoading: isDeleting }] = useDeleteApplicationMutation();
  const [setExpectedInterviews, { isLoading: isSettingExpected }] = useSetExpectedInterviewsMutation();
  const [scheduleInterview, { isLoading: isScheduling }] = useScheduleInterviewMutation();

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await updateApplicationStatus({ id, status }).unwrap();
      refetch();
    } catch (err: any) {
      alert("Error syncing status: " + (err.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("CRITICAL: Permanent deletion of candidate record. Proceed?")) {
      try {
        await deleteApplication(id).unwrap();
        refetch();
      } catch (err: any) {
        alert("Error during deletion: " + (err.data?.message || err.message));
      }
    }
  };

  const handleExportToCSV = () => {
    if (applications.length === 0) {
      alert("No applications to export");
      return;
    }

    const headers = ['Candidate Name', 'Email', 'Job Title', 'Status', 'Application Date', 'Interview Progress'];
    const rows = applications.map((app: any) => [
      app.candidate_name || 'N/A',
      app.candidate_email || 'N/A',
      app.job_title || app.offre?.titre || 'N/A',
      app.statut || 'N/A',
      new Date(app.date_candidature || app.date_postule).toLocaleDateString(),
      `${app.interviews_passed || 0}/${app.expected_interviews || 1}`,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `applications_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExpectedInterviewsChange = async (applicationId: number, value: number) => {
    try {
      await setExpectedInterviews({ applicationId, expectedInterviews: value }).unwrap();
      refetch();
    } catch (err: any) {
      alert("Error updating interview plan: " + (err.data?.message || err.message));
    }
  };

  const openScheduleModal = (application: any) => {
    if (!application) return;
    const nextStep = Math.min((application.interviews_total || 0) + 1, application.expected_interviews || 1);
    setSelectedApplication(application);
    setSelectedStep(nextStep);
    setScheduleModalOpen(true);
  };

  const handleScheduleSubmit = async (date: string) => {
    if (!selectedApplication) return;
    try {
      await scheduleInterview({
        applicationId: selectedApplication.id_candidature,
        step: selectedStep,
        date,
      }).unwrap();
      setScheduleModalOpen(false);
      refetch();
    } catch (err: any) {
      alert("Error scheduling interview: " + (err.data?.message || err.message));
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACCEPTED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'REJECTED': return 'bg-red-50 text-red-600 border-red-100';
      case 'INTERVIEW': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'UNDER_REVIEW': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-black tracking-widest text-xs uppercase animate-pulse">Synchronizing Pipeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 pt-4">
      <ScheduleInterviewModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSubmit={handleScheduleSubmit}
      />
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Application Engine</h1>
            <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-black tracking-widest uppercase text-center">V3 LIVE</span>
          </div>
          <p className="text-slate-500 font-medium text-lg italic">Direct management of your recruitment lifecycle records.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search candidates/offers..." 
              className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[20px] text-sm font-bold focus:ring-4 focus:ring-slate-100 focus:border-slate-900 transition-all w-80 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-4 bg-white border border-slate-200 text-slate-600 rounded-[20px] hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-6 h-6" />
          </button>
          <button 
            onClick={handleExportToCSV}
            className="p-4 bg-blue-600 text-white border border-blue-600 rounded-[20px] hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-95"
            title="Export applications to CSV"
          >
            <Download className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-[3px]">
                <th className="py-6 px-8 text-left font-black">Candidate Identification</th>
                <th className="py-6 px-8 text-left font-black">Target Listing</th>
                <th className="py-6 px-8 text-center font-black">Recruitment Stage</th>
                <th className="py-6 px-8 text-center font-black">Interview Workflow</th>
                <th className="py-6 px-8 text-center font-black">Record TS</th>
                <th className="py-6 px-8 text-right font-black">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center text-slate-300 italic font-black text-xl">Operational queue is currently empty.</td>
                </tr>
              ) : (
                applications.map((application: any) => {
                  const expected = application.expected_interviews || 1;
                  const passed = application.interviews_passed || 0;
                  const scheduled = application.interviews_total || 0;
                  const canScheduleNext = scheduled < expected && passed === scheduled;
                  const nextStep = Math.min(scheduled + 1, expected);

                  return (
                    <tr key={application.id_candidature} className="hover:bg-slate-50/50 transition-all group">
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs group-hover:scale-110 transition-transform shadow-md shadow-slate-200">
                            {application.candidate_name?.[0]}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm mb-0.5">{application.candidate_name}</p>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight flex items-center gap-1">
                              <Mail className="w-3 h-3 text-blue-500" />
                              {application.candidate_email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <div>
                          <p className="font-black text-slate-700 text-sm mb-1">{application.job_title || application.offre?.titre}</p>
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">AEROS RECRUITMENT</p>
                        </div>
                      </td>
                      <td className="py-6 px-8 text-center">
                        <div className="relative inline-block">
                          <select 
                            value={application.statut}
                            onChange={(e) => handleStatusUpdate(application.id_candidature, e.target.value)}
                            disabled={isUpdating}
                            className={`pl-4 pr-10 py-2.5 rounded-xl text-[10px] font-black uppercase border tracking-[2px] transition-all cursor-pointer outline-none appearance-none ${getStatusStyle(application.statut)} shadow-sm hover:shadow-md active:scale-95`}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="UNDER_REVIEW">UNDER REVIEW</option>
                            <option value="INTERVIEW">INTERVIEW</option>
                            <option value="ACCEPTED">ACCEPTED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                        </div>
                      </td>
                      <td className="py-6 px-8 text-center space-y-2">
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex gap-2 justify-center">
                            {[...Array(expected)].map((_, index) => {
                              const step = index + 1;
                              const completed = step <= passed;
                              const scheduledStep = step <= scheduled && !completed;
                              return (
                                <span key={step} className={`w-2 h-2 rounded-full ${completed ? 'bg-emerald-500' : scheduledStep ? 'bg-blue-400' : 'bg-slate-200'}`} />
                              );
                            })}
                          </div>
                          <div className="text-[11px] text-slate-500 font-bold">
                            {passed}/{expected} confirmed · {scheduled}/{expected} scheduled
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <select
                              value={expected}
                              onChange={(e) => handleExpectedInterviewsChange(application.id_candidature, Number(e.target.value))}
                              disabled={isSettingExpected}
                              className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-black uppercase tracking-[1px] bg-white"
                            >
                              {[1,2,3,4,5].map((count) => (
                                <option key={count} value={count}>{count} step{count > 1 ? 's' : ''}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => openScheduleModal(application)}
                              disabled={!canScheduleNext || isScheduling}
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-[11px] font-black uppercase tracking-[1px] transition-all ${canScheduleNext ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Step {nextStep}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-8 text-center text-slate-400 font-bold text-xs">
                        {new Date(application.date_candidature || application.date_postule).toLocaleDateString()}
                      </td>
                      <td className="py-6 px-8 text-right">
                        <button 
                          onClick={() => handleDelete(application.id_candidature)}
                          disabled={isDeleting}
                          className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 hover:border-red-600 active:scale-90"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompanyApplicationsManagement;
