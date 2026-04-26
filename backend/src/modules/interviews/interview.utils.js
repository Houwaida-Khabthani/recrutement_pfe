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
const JOIN_WINDOW_BEFORE_MS = 15 * 60 * 1000;  // 15 minutes before
const JOIN_WINDOW_AFTER_MS = 30 * 60 * 1000;   // 30 minutes after

/**
 * CRITICAL: Parse MySQL DATETIME as LOCAL time (not UTC)
 * MySQL format: "2026-04-25 14:42:00" (no timezone)
 * 
 * @param {string|Date} dateValue - Date from MySQL or JavaScript
 * @returns {number} - Unix timestamp in milliseconds
 */
const parseInterviewDate = (dateValue) => {
  if (!dateValue) return 0;
  
  const dateStr = String(dateValue).trim();
  
  // If already a Date object
  if (dateValue instanceof Date) {
    return dateValue.getTime();
  }
  
  // MySQL DATETIME format: "2026-04-25 14:42:00"
  // Replace space with T and parse as LOCAL time (no 'Z' suffix!)
  const normalized = dateStr.replace(' ', 'T');
  
  // Parse as local time - this is the KEY FIX
  // Using Date.parse() or new Date() with ISO format that has NO timezone
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
const getNow = () => Date.now();

/**
 * Check if user can join an interview based on time and status
 * @param {Object} interview - Interview object with date and status
 * @returns {Object} - Object with canJoin, reason, and timeInfo
 */
const checkIfUserCanJoin = (interview) => {
  const now = getNow();
  const interviewTimestamp = parseInterviewDate(interview.date);
  
  const timeDiff = interviewTimestamp - now;
  const minutesUntilInterview = Math.floor(timeDiff / (1000 * 60));

  const result = {
    canJoin: false,
    reason: '',
    timeInfo: {
      minutesUntil: minutesUntilInterview,
      interviewDate: new Date(interviewTimestamp).toISOString(),
      now: new Date(now).toISOString(),
      serverTime: new Date().toISOString()
    }
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
const getInterviewTimeStatus = (interview) => {
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
      canJoin: false
    };
  }

  if (minutesUntilInterview > 15) {
    return { 
      status: 'soon', 
      label: `Starts in ${minutesUntilInterview} minutes`,
      color: 'yellow',
      canJoin: false
    };
  }

  if (minutesUntilInterview > 0) {
    return { 
      status: 'ready', 
      label: 'Ready to join',
      color: 'green',
      canJoin: true
    };
  }

  if (minutesUntilInterview >= -30) {
    return { 
      status: 'in_progress', 
      label: 'In Progress',
      color: 'green',
      canJoin: true
    };
  }

  return { 
    status: 'expired', 
    label: 'Time Expired',
    color: 'gray',
    canJoin: false
  };
};

/**
 * Validate meeting link URL
 * @param {string} meetingLink - The meeting link to validate
 * @returns {Object} - Object with isValid and error message
 */
const validateMeetingLink = (meetingLink) => {
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
const formatTimeRemaining = (minutes) => {
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
 * @param {Date|string} interviewDate - Interview date
 * @returns {boolean} - True if joinable
 */
const isWithinJoinWindow = (interviewDate) => {
  const now = getNow();
  const interviewTimestamp = parseInterviewDate(interviewDate);
  
  const timeDiff = interviewTimestamp - now;
  const minutesUntilInterview = Math.floor(timeDiff / (1000 * 60));
  
  return minutesUntilInterview <= 15 && minutesUntilInterview >= -30;
};

module.exports = {
  // Core function - MUST use this for all date parsing
  parseInterviewDate,
  
  // Utility functions
  checkIfUserCanJoin,
  getInterviewTimeStatus,
  validateMeetingLink,
  formatTimeRemaining,
  isWithinJoinWindow,
  getNow,
  
  // Constants
  JOIN_WINDOW_BEFORE_MS,
  JOIN_WINDOW_AFTER_MS
};