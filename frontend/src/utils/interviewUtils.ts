/**
 * Interview Time Utilities - Unified Time Handling
 * 
 * ROOT CAUSE: MySQL DATETIME (e.g., "2026-04-25 14:42:00") has NO timezone info.
 * JavaScript Date parsing is inconsistent:
 *   - new Date("2026-04-25 14:42:00") → interprets as LOCAL time
 *   - new Date("2026-04-25T14:42:00Z") → interprets as UTC
 * 
 * SOLUTION: Treat MySQL DATETIME as LOCAL time, convert to timestamp using local time.
 * Use a single parsing function across ALL code (backend + frontend).
 */

// Time constants (in milliseconds)
export const JOIN_WINDOW_BEFORE_MS = 15 * 60 * 1000;  // 15 minutes before
export const JOIN_WINDOW_AFTER_MS = 30 * 60 * 1000;   // 30 minutes after

/**
 * CRITICAL: Parse MySQL DATETIME as LOCAL time (not UTC)
 * MySQL format: "2026-04-25 14:42:00" (no timezone)
 * 
 * @param {string|Date} dateValue - Date from MySQL or JavaScript
 * @returns {number} - Unix timestamp in milliseconds
 */
export const parseInterviewDate = (dateValue: string | Date): number => {
  if (!dateValue) return 0;
  
  // If already a Date object
  if (dateValue instanceof Date) {
    return dateValue.getTime();
  }
  
  const dateStr = String(dateValue).trim();
  
  // MySQL DATETIME format: "2026-04-25 14:42:00"
  // Replace space with T and parse as LOCAL time (no 'Z' suffix!)
  const normalized = dateStr.replace(' ', 'T');
  
  // Parse as local time - this is the KEY FIX
  // Using Date.parse() with ISO format that has NO timezone
  // will be interpreted as LOCAL time in JavaScript
  const timestamp = Date.parse(normalized);
  
  if (isNaN(timestamp)) {
    // Fallback: try direct parsing
    return new Date(dateStr).getTime();
  }
  
  return timestamp;
};

/**
 * Get current timestamp using the same reference as parsed dates
 * @returns {number} - Current timestamp in milliseconds
 */
export const getNow = (): number => Date.now();

/**
 * Check if user can join an interview based on time and status
 * @param {Object} interview - Interview object with date and status
 * @returns {Object} - Object with canJoin, reason, and timeInfo
 */
export const checkIfUserCanJoin = (interview: {
  date: string | Date;
  status: string;
}): { canJoin: boolean; reason: string; timeInfo: { minutesUntil: number } } => {
  const now = getNow();
  const interviewTimestamp = parseInterviewDate(interview.date);
  
  const timeDiff = interviewTimestamp - now;
  const minutesUntilInterview = Math.floor(timeDiff / (1000 * 60));

  const result = {
    canJoin: false,
    reason: '',
    timeInfo: {
      minutesUntil: minutesUntilInterview,
    },
  };

  // Check status first
  if (interview.status === 'cancelled') {
    result.reason = 'Interview has been cancelled';
    return result;
  }

  if (interview.status === 'done' || interview.status === 'passed') {
    result.reason = 'Interview has been completed';
    return result;
  }

  if (interview.status !== 'scheduled' && interview.status !== 'confirmed') {
    result.reason = `Interview status is ${interview.status}`;
    return result;
  }

  // Check time-based eligibility - 15 min before to 30 min after
  if (minutesUntilInterview > 15) {
    result.reason = 'Available at interview time';
    return result;
  }

  // User can join within the 15-minute window before or 30 minutes after
  if (minutesUntilInterview <= 15 && minutesUntilInterview >= -30) {
    result.canJoin = true;
    result.reason = 'Ready to join';
    return result;
  }

  // More than 30 minutes after scheduled time
  if (minutesUntilInterview < -30) {
    result.reason = 'Interview time has passed';
    return result;
  }

  return result;
};

/**
 * Get interview status based on time
 * @param {Object} interview - Interview object with date and status
 * @returns {Object} - Status info with label, color, and canJoin
 */
export const getInterviewTimeStatus = (interview: {
  date: string | Date;
  status: string;
}): { status: string; label: string; color: string; canJoin: boolean } => {
  const now = getNow();
  const interviewTimestamp = parseInterviewDate(interview.date);
  
  const timeDiff = interviewTimestamp - now;
  const minutesUntilInterview = Math.floor(timeDiff / (1000 * 60));

  if (interview.status === 'cancelled') {
    return { status: 'cancelled', label: 'Cancelled', color: 'red', canJoin: false };
  }

  if (interview.status === 'done' || interview.status === 'passed') {
    return { status: 'completed', label: 'Completed', color: 'green', canJoin: false };
  }

  if (minutesUntilInterview > 60) {
    return {
      status: 'upcoming',
      label: `Starts in ${Math.floor(minutesUntilInterview / 60)}h ${minutesUntilInterview % 60}m`,
      color: 'blue',
      canJoin: false,
    };
  }

  if (minutesUntilInterview > 15) {
    return {
      status: 'soon',
      label: `Starts in ${minutesUntilInterview} minutes`,
      color: 'yellow',
      canJoin: false,
    };
  }

  if (minutesUntilInterview > 0) {
    return {
      status: 'ready',
      label: 'Ready to join',
      color: 'green',
      canJoin: true,
    };
  }

  if (minutesUntilInterview >= -30) {
    return {
      status: 'in_progress',
      label: 'In Progress',
      color: 'green',
      canJoin: true,
    };
  }

  return {
    status: 'expired',
    label: 'Time Expired',
    color: 'gray',
    canJoin: false,
  };
};

/**
 * Validate meeting link URL
 * @param {string} meetingLink - The meeting link to validate
 * @returns {Object} - Object with isValid and error message
 */
export const validateMeetingLink = (
  meetingLink: string
): { isValid: boolean; error: string | null } => {
  if (!meetingLink) {
    return { isValid: false, error: 'No meeting link provided' };
  }

  try {
    const url = new URL(meetingLink);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { isValid: false, error: 'Invalid meeting link protocol' };
    }
    return { isValid: true, error: null };
  } catch (e) {
    return { isValid: false, error: 'Invalid meeting link format' };
  }
};

/**
 * Format time remaining for display
 * @param {number} minutes - Minutes until interview
 * @returns {string} - Formatted time string
 */
export const formatTimeRemaining = (minutes: number): string => {
  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
  if (minutes > 0) {
    return `${minutes} min`;
  }
  if (minutes >= -30) {
    return 'In Progress';
  }
  return 'Ended';
};

/**
 * Check if interview is within joinable window (15 min before to 30 min after)
 * @param {Date | string} interviewDate - Interview date
 * @returns {boolean} - True if joinable
 */
export const isWithinJoinWindow = (interviewDate: Date | string): boolean => {
  const now = getNow();
  const interviewTimestamp = parseInterviewDate(interviewDate);
  
  const timeDiff = interviewTimestamp - now;
  const minutesUntilInterview = Math.floor(timeDiff / (1000 * 60));

  return minutesUntilInterview <= 15 && minutesUntilInterview >= -30;
};

/**
 * Format date for display
 * @param {Date | string} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatInterviewDate = (date: Date | string): string => {
  const timestamp = parseInterviewDate(date);
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get button config based on interview status and time
 * @param {Object} interview - Interview object
 * @returns {Object} - Button configuration
 */
export const getJoinButtonConfig = (interview: {
  date: string | Date;
  status: string;
  meeting_link?: string | null;
}): {
  text: string;
  disabled: boolean;
  variant: 'primary' | 'success' | 'danger' | 'secondary';
  tooltip: string;
  action: 'join' | 'finished' | 'cancelled' | 'waiting';
} => {
  const timeStatus = getInterviewTimeStatus(interview);

  // Cancelled interview
  if (interview.status === 'cancelled') {
    return {
      text: 'Meeting Cancelled',
      disabled: true,
      variant: 'danger',
      tooltip: 'This interview has been cancelled',
      action: 'cancelled',
    };
  }

  // Completed interview
  if (interview.status === 'done' || interview.status === 'passed') {
    return {
      text: 'Meeting Finished',
      disabled: true,
      variant: 'secondary',
      tooltip: 'This interview has been completed',
      action: 'finished',
    };
  }

  // Scheduled interview - check time
  if (timeStatus.status === 'upcoming' || timeStatus.status === 'soon') {
    return {
      text: 'Join Meeting',
      disabled: true,
      variant: 'secondary',
      tooltip: timeStatus.label,
      action: 'waiting',
    };
  }

  // Ready or in progress
  if (timeStatus.canJoin) {
    return {
      text: 'Join Meeting',
      disabled: false,
      variant: 'success',
      tooltip: 'Click to join the meeting',
      action: 'join',
    };
  }

  // Expired
  return {
    text: 'Join Meeting',
    disabled: true,
    variant: 'secondary',
    tooltip: 'Interview time has passed',
    action: 'waiting',
  };
};