import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, CheckCircle, XCircle, AlertCircle, Plus, Edit3 } from 'lucide-react';
import {
  useGetApplicationInterviewsQuery,
  useSetExpectedInterviewsMutation,
  useScheduleInterviewStepMutation,
  useUpdateInterviewStatusMutation,
  useUpdateMeetingLinkMutation,
  useConfirmInterviewMutation
} from '../store/api/interviewApi';
import JoinMeetingButton from './JoinMeetingButton';
import MeetingLinkForm from './MeetingLinkForm';
import { useAppSelector } from '../hooks/useAppSelector';

interface InterviewTimelineProps {
  applicationId: number;
  candidateName: string;
  jobTitle: string;
  onClose: () => void;
}

const InterviewTimeline: React.FC<InterviewTimelineProps> = ({
  applicationId,
  candidateName,
  jobTitle,
  onClose
}) => {
  const [expectedInterviews, setExpectedInterviews] = useState(1);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('10:00');

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const { data: interviews = [], isLoading } = useGetApplicationInterviewsQuery(applicationId);
  const [setExpected] = useSetExpectedInterviewsMutation();
  const [scheduleStep] = useScheduleInterviewStepMutation();
  const [updateStatus] = useUpdateInterviewStatusMutation();
  const [updateMeetingLink] = useUpdateMeetingLinkMutation();
  const [confirmInterview, { isLoading: isConfirming }] = useConfirmInterviewMutation();

  // Get user role from auth state
  const user = useAppSelector((state: any) => state.auth.user);
  const userRole = user?.role || 'recruiter';
  
  // Debug
  console.log('[InterviewTimeline] user:', user);
  console.log('[InterviewTimeline] userRole:', userRole);
  console.log('[InterviewTimeline] interviews:', interviews);

  // Listen for real-time meeting link updates
  useEffect(() => {
    const socket = (window as any).socket;
    if (!socket) return;

    const handleMeetingLinkAdded = (data: any) => {
      console.log('[InterviewTimeline] Meeting link added:', data);
      // Refetch interviews to get updated data
      // The RTK Query will automatically refetch due to cache invalidation
    };

    socket.on('meeting_link_added', handleMeetingLinkAdded);

    return () => {
      socket.off('meeting_link_added', handleMeetingLinkAdded);
    };
  }, []);

  // Toast helpers
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSetExpectedInterviews = async () => {
    try {
      await setExpected({ applicationId, expected_interviews: expectedInterviews }).unwrap();
      showToast(`Expected interviews updated to ${expectedInterviews} round${expectedInterviews > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Failed to set expected interviews:', error);
      showToast('Failed to update expected interviews', 'error');
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedStep || !scheduleDate) return;

    try {
      const dateTime = `${scheduleDate}T${scheduleTime}:00`;
      await scheduleStep({
        applicationId,
        step: selectedStep,
        date: dateTime
      }).unwrap();
      setShowScheduleForm(false);
      setSelectedStep(null);
      setScheduleDate('');
      setScheduleTime('10:00');
      showToast(`Interview Round ${selectedStep} scheduled successfully`);
    } catch (error: any) {
      console.error('Failed to schedule interview:', error);
      showToast(error?.data?.message || 'Failed to schedule interview', 'error');
    }
  };

  const handleUpdateStatus = async (interviewId: number, status: string, notes?: string) => {
    try {
      await updateStatus({ id: interviewId, status, notes }).unwrap();
      const statusText = status === 'passed' ? 'marked as passed' : status === 'failed' ? 'marked as failed' :
                        status === 'confirmed' ? 'confirmed' : status === 'cancelled' ? 'cancelled' : 'updated';
      showToast(`Interview ${statusText} successfully`);
    } catch (error: any) {
      console.error('Failed to update interview status:', error);
      showToast(error?.data?.message || 'Failed to update interview status', 'error');
    }
  };

  const handleConfirmInterview = async (interviewId: number) => {
    try {
      await confirmInterview(interviewId).unwrap();
      showToast('Interview confirmed successfully!');
    } catch (error: any) {
      console.error('Failed to confirm interview:', error);
      showToast(error?.data?.message || 'Failed to confirm interview', 'error');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-600" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'scheduled':
        return <Clock className="w-5 h-5 text-amber-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'cancelled':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      case 'confirmed':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'scheduled':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const canScheduleStep = (step: number) => {
    if (step === 1) return true; // Can always schedule first interview
    if (!Array.isArray(interviews)) return false;

    // Check if previous step passed
    const prevInterview = interviews.find((i: any) => i.step === step - 1);
    return prevInterview && prevInterview.status === 'passed';
  };

  const maxExpected = Array.isArray(interviews) && interviews[0]?.expected_interviews ? interviews[0].expected_interviews : 1;
  const scheduledCount = Array.isArray(interviews) ? interviews.length : 0;
  const passedCount = Array.isArray(interviews) ? interviews.filter((i: any) => i.status === 'passed').length : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight">{candidateName}</h2>
            <p className="text-blue-100 font-medium">{jobTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        {/* Interview Configuration */}
        <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-200">
          <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Interview Configuration
          </h3>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-600 mb-2">
                Expected Interview Rounds
              </label>
              <select
                value={expectedInterviews}
                onChange={(e) => setExpectedInterviews(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num} Round{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSetExpectedInterviews}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
              >
                Update
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-2xl font-black text-blue-600">{maxExpected}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Expected</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-2xl font-black text-amber-600">{scheduledCount}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Scheduled</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-2xl font-black text-green-600">{passedCount}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Passed</div>
            </div>
          </div>
        </div>

        {/* Interview Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900">Interview Timeline</h3>
            <button
              onClick={() => {
                // Find the next step that can be scheduled
                const nextStep = Array.from({ length: maxExpected }, (_, i) => i + 1)
                  .find(step => canScheduleStep(step) && !interviews.find((i: any) => i.step === step));
                if (nextStep) {
                  setSelectedStep(nextStep);
                  setShowScheduleForm(true);
                }
              }}
              disabled={scheduledCount >= maxExpected}
              className={`flex items-center gap-2 px-4 py-2 font-bold rounded-xl transition-all ${
                scheduledCount >= maxExpected
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              Schedule Interview
            </button>
          </div>

          {interviews.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No interviews scheduled yet</p>
              <p className="text-sm">Schedule the first interview round to begin the process</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from({ length: maxExpected }, (_, i) => i + 1).map(step => {
                const interview = interviews.find((i: any) => i.step === step);
                const canSchedule = canScheduleStep(step);

                return (
                  <div key={step} className="relative">
                    {/* Timeline line */}
                    {step < maxExpected && (
                      <div className="absolute left-6 top-16 w-0.5 h-12 bg-slate-200"></div>
                    )}

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-white ${
                            interview ? 'bg-blue-600' : 'bg-slate-300'
                          }`}>
                            {step}
                          </div>

                          <div className="flex-1">
                            <h4 className="text-lg font-black text-slate-900">
                              Interview Round {step}
                            </h4>

                            {interview ? (
                              <div className="mt-3 space-y-3">
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(interview.date).toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {new Date(interview.date).toLocaleTimeString()}
                                  </div>
                                </div>

                                {interview.meetingLink && (
                                  <div className="flex items-center gap-2">
                                    <Video className="w-4 h-4 text-blue-600" />
                                    <a
                                      href={interview.meetingLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline font-medium"
                                    >
                                      Join Meeting
                                    </a>
                                  </div>
                                )}

                                {/* Show inline form for recruiters if no meeting link, otherwise show JoinMeetingButton */}
                                {interview && (userRole === 'recruiter' || userRole === 'admin') && (
                                  <div className="mt-3">
                                    {!interview.meetingLink ? (
                                      <MeetingLinkForm
                                        interview={{
                                          id_interview: interview.id,
                                          step: interview.step,
                                          date: interview.date,
                                          meeting_link: interview.meetingLink,
                                          status: interview.status
                                        }}
                                        onSuccess={() => {
                                          showToast('Meeting link saved! Opening meeting...', 'success');
                                        }}
                                      />
                                    ) : (
                                      <JoinMeetingButton
                                        interview={{
                                          id_interview: interview.id,
                                          step: interview.step,
                                          date: interview.date,
                                          meeting_link: interview.meetingLink,
                                          status: interview.status,
                                          notes: interview.notes
                                        }}
                                        userRole="recruiter"
                                        onMeetingLinkUpdate={async (interviewId, meetingLink) => {
                                          try {
                                            await updateMeetingLink({ interviewId, meeting_link: meetingLink }).unwrap();
                                            showToast('Meeting link saved successfully', 'success');
                                          } catch (error) {
                                            console.error('Failed to update meeting link:', error);
                                            showToast('Failed to save meeting link', 'error');
                                          }
                                        }}
                                        size="sm"
                                        showCountdown={false}
                                      />
                                    )}
                                  </div>
                                )}

                                {interview.notes && (
                                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                    <p className="text-sm text-slate-700">{interview.notes}</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-slate-500 mt-2">
                                {canSchedule ? 'Not scheduled yet' : `Waiting for Round ${step - 1} to pass`}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {interview ? (
                            <>
                              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(interview.status)}`}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(interview.status)}
                                  {interview.status.toUpperCase()}
                                </div>
                              </div>

                              {interview.status === 'scheduled' && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleConfirmInterview(interview.id)}
                                    disabled={isConfirming}
                                    className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isConfirming ? 'Confirming...' : 'Confirm'}
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(interview.id, 'cancelled')}
                                    className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}

                              {(interview.status === 'confirmed') && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleUpdateStatus(interview.id, 'passed')}
                                    className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-all"
                                  >
                                    ✅ Pass
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(interview.id, 'failed')}
                                    className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all"
                                  >
                                    ❌ Fail
                                  </button>
                                </div>
                              )}
                            </>
                          ) : canSchedule && scheduledCount < maxExpected ? (
                            <button
                              onClick={() => {
                                setSelectedStep(step);
                                setShowScheduleForm(true);
                              }}
                              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
                            >
                              Schedule
                            </button>
                          ) : (
                            <div className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg">
                              {scheduledCount >= maxExpected ? 'Limit Reached' : 'Locked'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {showScheduleForm && selectedStep && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/30">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6">
            <h3 className="text-xl font-black text-slate-900 mb-6">
              Schedule Interview Round {selectedStep}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowScheduleForm(false);
                  setSelectedStep(null);
                  setScheduleDate('');
                  setScheduleTime('10:00');
                }}
                className="flex-1 px-4 py-3 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleInterview}
                className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-[10001] rounded-3xl border px-5 py-4 shadow-xl transition-all ${
          toastType === 'success' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-rose-600 text-white border-rose-700'
        }`}>
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}
    </div>
  );
};

export default InterviewTimeline;