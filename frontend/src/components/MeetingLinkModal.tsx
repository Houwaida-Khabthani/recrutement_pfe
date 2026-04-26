/**
 * MeetingLinkModal Component
 * Modal form for recruiters to add/update meeting links for interviews
 */

import React, { useState, useEffect } from 'react';
import { X, Link, Copy, Check, Loader2, AlertCircle, Video, ExternalLink } from 'lucide-react';
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

interface MeetingLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: Interview | null;
  onSuccess?: (meetingLink: string) => void;
}

const MeetingLinkModal: React.FC<MeetingLinkModalProps> = ({
  isOpen,
  onClose,
  interview,
  onSuccess
}) => {
  const [meetingLink, setMeetingLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [updateMeetingLink, { isLoading }] = useUpdateMeetingLinkMutation();

  // Reset state when modal opens/closes or interview changes
  useEffect(() => {
    if (isOpen) {
      setMeetingLink(interview?.meeting_link || '');
      setError(null);
      setCopied(false);
      setShowSuccess(false);
    }
  }, [isOpen, interview]);

  // Handle input change with validation
  const handleInputChange = (value: string) => {
    setMeetingLink(value);
    setError(null);
    
    // Real-time validation
    if (value && !validateMeetingLink(value).isValid) {
      setError('Please enter a valid URL (e.g., https://zoom.us/...)');
    }
  };

  // Copy link to clipboard
  const handleCopy = async () => {
    if (!meetingLink) return;
    
    try {
      await navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const interviewId = interview?.id_interview || interview?.id;
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
      const result = await updateMeetingLink({
        interviewId,
        meeting_link: meetingLink.trim() || null
      }).unwrap();

      setShowSuccess(true);
      
      // Call success callback
      if (onSuccess) {
        onSuccess(meetingLink.trim());
      }

      // Close modal after short delay or immediately open meeting
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to update meeting link');
    }
  };

  // Handle save and start meeting
  const handleSaveAndStart = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const interviewId = interview?.id_interview || interview?.id;
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

      // Open meeting in new tab
      if (meetingLink) {
        window.open(meetingLink, '_blank', 'noopener,noreferrer');
      }

      if (onSuccess) {
        onSuccess(meetingLink.trim());
      }

      onClose();
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to update meeting link');
    }
  };

  if (!isOpen) return null;

  const interviewDate = interview?.date 
    ? new Date(interview.date).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black">Add Meeting Link</h2>
                <p className="text-blue-100 text-sm">Round {interview?.step} Interview</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Interview Info */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="font-bold">Scheduled:</span>
              <span>{interviewDate}</span>
            </div>
            {interview?.status && (
              <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                <span className="font-bold">Status:</span>
                <span className="capitalize">{interview.status}</span>
              </div>
            )}
          </div>

          {showSuccess ? (
            /* Success State */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Meeting Link Saved!</h3>
              <p className="text-slate-500 text-sm">The meeting link has been updated successfully.</p>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit}>
              {/* Input Field */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Meeting Link
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Link className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    value={meetingLink}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                    className={`
                      w-full pl-10 pr-10 py-3 
                      bg-white border rounded-xl text-sm font-medium
                      focus:ring-4 focus:ring-blue-50 focus:border-blue-400 
                      transition-all outline-none
                      ${error 
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-50' 
                        : 'border-slate-200'
                      }
                    `}
                    disabled={isLoading}
                  />
                  {meetingLink && (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
                
                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Helper Text */}
                {!error && (
                  <p className="mt-2 text-xs text-slate-500">
                    Paste your Zoom, Google Meet, or any video conferencing link
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !!error}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>

              {/* Save & Start Button */}
              {meetingLink && !error && (
                <button
                  type="button"
                  onClick={handleSaveAndStart}
                  disabled={isLoading}
                  className="w-full mt-3 px-4 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Save & Start Meeting
                    </>
                  )}
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingLinkModal;