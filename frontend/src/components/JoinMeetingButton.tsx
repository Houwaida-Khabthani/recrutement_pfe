/**
 * JoinMeetingButton Component
 * Dynamic button that activates 10 minutes before interview time
 * Handles both external meeting links and internal navigation
 * Supports recruiter modal for adding meeting links
 */

import React, { useState, useEffect } from 'react';
import { Video, ExternalLink, Clock, AlertCircle, CheckCircle, XCircle, Plus } from 'lucide-react';
import { 
  getJoinButtonConfig, 
  formatTimeRemaining, 
  validateMeetingLink,
  isWithinJoinWindow,
  getInterviewTimeStatus,
  parseInterviewDate,
  getNow
} from '../utils/interviewUtils';
import MeetingLinkModal from './MeetingLinkModal';

interface Interview {
  id_interview?: number;
  id?: number;
  step: number;
  date: string | Date;
  location?: string;
  meeting_link?: string | null;
  status: string;
  notes?: string;
}

interface JoinMeetingButtonProps {
  interview: Interview;
  userRole?: 'candidate' | 'recruiter' | 'admin';
  onJoin?: (interview: Interview) => void;
  onMeetingLinkUpdate?: (interviewId: number, meetingLink: string) => void;
  size?: 'sm' | 'md' | 'lg';
  showCountdown?: boolean;
  className?: string;
}

const JoinMeetingButton: React.FC<JoinMeetingButtonProps> = ({
  interview,
  userRole = 'candidate',
  onJoin,
  onMeetingLinkUpdate,
  size = 'md',
  showCountdown = true,
  className = ''
}) => {
  const [countdown, setCountdown] = useState<number>(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [localMeetingLink, setLocalMeetingLink] = useState(interview.meeting_link);

  // Update local meeting link when prop changes
  useEffect(() => {
    setLocalMeetingLink(interview.meeting_link);
  }, [interview.meeting_link]);

  // Calculate time remaining every minute using unified time handling
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = getNow();
      const interviewTimestamp = parseInterviewDate(interview.date);
      const diff = interviewTimestamp - now;
      setCountdown(Math.floor(diff / (1000 * 60))); // minutes
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [interview.date]);

  const config = getJoinButtonConfig(interview);
  const timeStatus = getInterviewTimeStatus(interview);
  const linkValidation = validateMeetingLink(localMeetingLink || '');
  const canJoin = isWithinJoinWindow(interview.date);
  const isRecruiter = userRole === 'recruiter' || userRole === 'admin';
  const hasMeetingLink = !!localMeetingLink && localMeetingLink.trim() !== '';

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  // Handle join click
  const handleJoin = () => {
    if (config.disabled || config.action !== 'join') return;

    const meetingLink = localMeetingLink;
    if (!meetingLink) {
      // If no meeting link and recruiter, open modal
      if (isRecruiter) {
        setShowModal(true);
      }
      return;
    }

    // Check if it's an external link (different domain)
    try {
      const url = new URL(meetingLink);
      const currentHost = window.location.hostname;
      
      // External link - open in new tab
      if (!url.hostname.includes(currentHost) && !url.hostname.includes('localhost')) {
        window.open(meetingLink, '_blank', 'noopener,noreferrer');
      } else {
        // Internal link - navigate
        window.location.href = meetingLink;
      }
      
      if (onJoin) {
        onJoin(interview);
      }
    } catch (e) {
      // If URL parsing fails, try as relative path
      window.location.href = meetingLink;
      if (onJoin) {
        onJoin(interview);
      }
    }
  };

  // Handle click when no meeting link
  const handleNoLinkClick = () => {
    if (isRecruiter) {
      // Open modal to add meeting link
      setShowModal(true);
    }
    // For candidates, do nothing (button is disabled)
  };

  // Handle meeting link update from modal
  const handleMeetingLinkSaved = (newLink: string) => {
    setLocalMeetingLink(newLink);
    const interviewId = interview.id_interview || interview.id;
    if (interviewId && onMeetingLinkUpdate) {
      onMeetingLinkUpdate(interviewId, newLink);
    }
  };

  // Render status badge
  const renderStatusBadge = () => {
    const statusColors: Record<string, string> = {
      upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
      soon: 'bg-amber-100 text-amber-700 border-amber-200',
      ready: 'bg-green-100 text-green-700 border-green-200',
      in_progress: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      completed: 'bg-gray-100 text-gray-700 border-gray-200',
      expired: 'bg-gray-100 text-gray-500 border-gray-200'
    };

    const statusIcons: Record<string, React.ReactNode> = {
      upcoming: <Clock className={iconSizes[size]} />,
      soon: <Clock className={iconSizes[size]} />,
      ready: <CheckCircle className={iconSizes[size]} />,
      in_progress: <Video className={iconSizes[size]} />,
      cancelled: <XCircle className={iconSizes[size]} />,
      completed: <CheckCircle className={iconSizes[size]} />,
      expired: <AlertCircle className={iconSizes[size]} />
    };

    const colorClass = statusColors[timeStatus.status] || statusColors.expired;
    const icon = statusIcons[timeStatus.status] || statusIcons.expired;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
        {icon}
        {timeStatus.label}
      </span>
    );
  };

  // Render button based on variant and meeting link availability
  const renderButton = () => {
    // Case 1: Has meeting link - show join button
    if (hasMeetingLink) {
      const variantClasses = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25',
        success: 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25 animate-pulse',
        danger: 'bg-red-500/50 text-red-700 cursor-not-allowed',
        secondary: 'bg-slate-200 text-slate-500 cursor-not-allowed'
      };

      const variant = config.variant as keyof typeof variantClasses;
      const baseClasses = variantClasses[variant];

      return (
        <button
          onClick={handleJoin}
          disabled={config.disabled}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            ${sizeClasses[size]}
            ${baseClasses}
            font-bold rounded-xl
            flex items-center justify-center gap-2
            transition-all duration-200
            ${!config.disabled ? 'transform hover:scale-105 active:scale-95' : ''}
            ${className}
          `}
          title={config.tooltip}
        >
          <Video className={iconSizes[size]} />
          {config.text}
          {!config.disabled && <ExternalLink className={iconSizes[size]} />}
        </button>
      );
    }

    // Case 2: No meeting link - recruiter can add
    if (isRecruiter) {
      return (
        <button
          onClick={handleNoLinkClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            ${sizeClasses[size]}
            bg-amber-500 hover:bg-amber-600 text-white
            font-bold rounded-xl
            flex items-center justify-center gap-2
            transition-all duration-200
            transform hover:scale-105 active:scale-95
            ${className}
          `}
          title="Add meeting link to start the meeting"
        >
          <Plus className={iconSizes[size]} />
          Add Meeting Link
        </button>
      );
    }

    // Case 3: No meeting link - candidate sees disabled button
    return (
      <button
        disabled={true}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          ${sizeClasses[size]}
          bg-slate-100 text-slate-400 cursor-not-allowed
          font-bold rounded-xl
          flex items-center justify-center gap-2
          ${className}
        `}
        title="Waiting for recruiter to start the meeting"
      >
        <Clock className={iconSizes[size]} />
        Waiting for Link
      </button>
    );
  };

  // Render countdown timer
  const renderCountdown = () => {
    if (!showCountdown) return null;
    if (interview.status === 'cancelled' || interview.status === 'done' || interview.status === 'passed') {
      return null;
    }

    return (
      <div className="mt-3 flex items-center justify-center gap-2 text-sm">
        <Clock className="w-4 h-4 text-slate-500" />
        <span className="text-slate-600 font-medium">
          {countdown > 0 && countdown <= 10 ? (
            <>Starting in <span className="text-blue-600 font-black">{countdown} min</span></>
          ) : countdown <= 0 && countdown >= -30 ? (
            <span className="text-green-600 font-black">In Progress</span>
          ) : countdown < -30 ? (
            <span className="text-slate-500">Ended</span>
          ) : (
            <>Starts in <span className="font-black">{formatTimeRemaining(countdown)}</span></>
          )}
        </span>
      </div>
    );
  };

  // Render validation warning
  const renderValidationWarning = () => {
    if (hasMeetingLink && config.action === 'join' && !linkValidation.isValid) {
      return (
        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
          <AlertCircle className="w-3 h-3" />
          <span>Invalid meeting link configured</span>
        </div>
      );
    }
    return null;
  };

  // Render waiting message for candidate without link
  const renderWaitingMessage = () => {
    if (!hasMeetingLink && !isRecruiter) {
      return (
        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
          <AlertCircle className="w-3 h-3" />
          <span>Waiting for recruiter to start the meeting</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center">
      {renderStatusBadge()}
      <div className="mt-3">
        {renderButton()}
      </div>
      {renderCountdown()}
      {renderValidationWarning()}
      {renderWaitingMessage()}

      {/* Meeting Link Modal */}
      <MeetingLinkModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        interview={interview}
        onSuccess={handleMeetingLinkSaved}
      />
    </div>
  );
};

export default JoinMeetingButton;