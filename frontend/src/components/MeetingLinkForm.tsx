/**
 * MeetingLinkForm Component
 * Inline form for recruiters to add meeting links directly in the timeline
 */

import React, { useState } from 'react';
import { Link, Save, ExternalLink, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useUpdateMeetingLinkMutation } from '../store/api/interviewApi';
import { validateMeetingLink } from '../utils/interviewUtils';

interface Interview {
  id_interview?: number;
  id?: number;
  step: number;
  date: string | Date;
  meeting_link?: string | null;
  status: string;
}

interface MeetingLinkFormProps {
  interview: Interview;
  onSuccess?: (meetingLink: string) => void;
}

const MeetingLinkForm: React.FC<MeetingLinkFormProps> = ({
  interview,
  onSuccess
}) => {
  const [meetingLink, setMeetingLink] = useState(interview.meeting_link || '');
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [updateMeetingLink, { isLoading }] = useUpdateMeetingLinkMutation();

  const interviewId = interview.id_interview || interview.id;
  
  // Debug
  console.log('[MeetingLinkForm] interview:', interview);
  console.log('[MeetingLinkForm] interviewId:', interviewId);
  console.log('[MeetingLinkForm] meeting_link:', interview.meeting_link);

  // Handle input change with validation
  const handleInputChange = (value: string) => {
    setMeetingLink(value);
    setError(null);
    
    // Real-time validation
    if (value && !validateMeetingLink(value).isValid) {
      setError('Invalid URL format');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!interviewId) {
      setError('Interview ID not found');
      return;
    }

    // Validate before submitting
    if (meetingLink) {
      const validation = validateMeetingLink(meetingLink);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid meeting link');
        return;
      }
    }

    try {
      await updateMeetingLink({
        interviewId,
        meeting_link: meetingLink.trim() || null
      }).unwrap();

      setShowSuccess(true);
      
      // Call success callback
      if (onSuccess) {
        onSuccess(meetingLink.trim());
      }

      // Open meeting in new tab
      if (meetingLink) {
        window.open(meetingLink, '_blank', 'noopener,noreferrer');
      }

      // Reset success state after delay
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to save meeting link');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="url"
            value={meetingLink}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="https://meet.google.com/... or https://zoom.us/..."
            className={`w-full pl-10 pr-4 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-blue-50 focus:border-blue-400 transition-all ${
              error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
            }`}
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !meetingLink.trim()}
          className={`px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 transition-all ${
            isLoading || !meetingLink.trim()
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : showSuccess ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isLoading ? 'Saving...' : showSuccess ? 'Saved!' : 'Save & Start'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </div>
      )}

      {/* Helper text */}
      {!error && !meetingLink && (
        <p className="text-xs text-slate-500">
          Enter a Google Meet, Zoom, or Teams link
        </p>
      )}
    </form>
  );
};

export default MeetingLinkForm;