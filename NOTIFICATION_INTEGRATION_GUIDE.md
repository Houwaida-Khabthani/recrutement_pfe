# Notification System - Integration Examples

## 🔌 How to Send Notifications from Different Parts of the Application

### Example 1: After Application Submission (Candidate)

**File:** `backend/src/modules/applications/application.service.js`

```javascript
const notificationService = require("../notifications/notification.service");

exports.submitApplication = async (data) => {
  // ... existing code to save application
  
  const result = await applicationModel.create(data);
  
  // Send notification to company recruiter
  await notificationService.createNotification({
    title: "New Application Received",
    message: `New application from ${candidateName} for ${jobTitle}`,
    type: "info",
    id_user: companyUserId
  });
  
  // Send notification to candidate
  await notificationService.createNotification({
    title: "Application Submitted",
    message: `Your application for ${jobTitle} has been submitted successfully`,
    type: "success",
    id_user: candidateId
  });
  
  return result;
};
```

### Example 2: Job Approval/Rejection (Admin)

**File:** `backend/src/modules/jobs/job.service.js`

```javascript
const notificationService = require("../notifications/notification.service");

exports.approveJob = async (jobId, companyId, companyUserId) => {
  // ... update job status
  
  // Notify company that job was approved
  await notificationService.createNotification({
    title: "Job Posting Approved",
    message: `Your job posting "${jobTitle}" has been approved and is now live`,
    type: "success",
    id_user: companyUserId
  });
  
  return updatedJob;
};

exports.rejectJob = async (jobId, companyId, companyUserId, reason) => {
  // ... update job status
  
  // Notify company that job was rejected
  await notificationService.createNotification({
    title: "Job Posting Rejected",
    message: `Your job posting was rejected. Reason: ${reason}`,
    type: "error",
    id_user: companyUserId
  });
  
  return updatedJob;
};
```

### Example 3: Interview Scheduled (HR/Company)

**File:** `backend/src/modules/interviews/interview.service.js`

```javascript
const notificationService = require("../notifications/notification.service");

exports.scheduleInterview = async (data) => {
  const interview = await interviewModel.create(data);
  
  const interviewDate = new Date(data.interview_date).toLocaleDateString('fr-FR');
  
  // Notify candidate
  await notificationService.createNotification({
    title: "Interview Scheduled",
    message: `You have been scheduled for an interview on ${interviewDate} at ${data.interview_time}`,
    type: "info",
    id_user: data.candidate_id
  });
  
  // Notify recruiter
  await notificationService.createNotification({
    title: "Interview Confirmed",
    message: `Interview with ${candidateName} scheduled for ${interviewDate} at ${data.interview_time}`,
    type: "info",
    id_user: data.recruiter_id
  });
  
  return interview;
};

exports.cancelInterview = async (interviewId) => {
  const interview = await interviewModel.getById(interviewId);
  
  // Notify candidate
  await notificationService.createNotification({
    title: "Interview Cancelled",
    message: `Your scheduled interview has been cancelled. Please contact the recruiter for more information`,
    type: "warning",
    id_user: interview.candidate_id
  });
  
  // Notify recruiter
  await notificationService.createNotification({
    title: "Interview Cancelled",
    message: `Interview with ${candidateName} has been cancelled`,
    type: "warning",
    id_user: interview.recruiter_id
  });
};
```

### Example 4: Company Approval (Admin)

**File:** `backend/src/modules/companies/company.service.js`

```javascript
const notificationService = require("../notifications/notification.service");

exports.approveCompany = async (companyId, adminId) => {
  // ... update company status
  
  // Get company admin user
  const companyAdmin = await userModel.getCompanyAdmin(companyId);
  
  // Send approval notification
  await notificationService.createNotification({
    title: "Company Approved",
    message: `Your company "${companyName}" has been approved and verified. You can now post job offers!`,
    type: "success",
    id_user: companyAdmin.id_user
  });
  
  return updatedCompany;
};

exports.rejectCompany = async (companyId, reason) => {
  // ... update company status
  
  const companyAdmin = await userModel.getCompanyAdmin(companyId);
  
  await notificationService.createNotification({
    title: "Company Registration Rejected",
    message: `Your company registration was rejected. Reason: ${reason}. Please contact support for more details.`,
    type: "error",
    id_user: companyAdmin.id_user
  });
  
  return updatedCompany;
};
```

### Example 5: Application Status Changed (Company to Candidate)

**File:** `backend/src/modules/applications/application.service.js`

```javascript
const notificationService = require("../notifications/notification.service");

exports.updateApplicationStatus = async (applicationId, status) => {
  const application = await applicationModel.getById(applicationId);
  
  const messages = {
    'en_attente': 'Your application is pending review',
    'acceptee': 'Congratulations! Your application has been accepted',
    'rejetee': 'Unfortunately, your application was not selected',
    'entretien': 'You have been selected for an interview'
  };
  
  const types = {
    'en_attente': 'info',
    'acceptee': 'success',
    'rejetee': 'error',
    'entretien': 'info'
  };
  
  await notificationService.createNotification({
    title: `Application Status: ${status}`,
    message: messages[status],
    type: types[status],
    id_user: application.candidate_id
  });
  
  return updatedApplication;
};
```

### Example 6: Profile Updated (User)

**File:** `backend/src/modules/candidates/candidate.service.js`

```javascript
const notificationService = require("../notifications/notification.service");

exports.updateProfile = async (userId, profileData) => {
  // ... update profile
  
  // Send notification to user
  await notificationService.createNotification({
    title: "Profile Updated",
    message: "Your profile has been successfully updated",
    type: "success",
    id_user: userId
  });
  
  return updatedProfile;
};
```

### Example 7: Batch Notifications (Admin Dashboard Task)

**File:** `backend/src/modules/admin/admin.service.js`

```javascript
const notificationService = require("../notifications/notification.service");

exports.notifyAllCandidates = async (message, type = 'info') => {
  const candidates = await userModel.getAllByRole('CANDIDAT');
  
  for (const candidate of candidates) {
    await notificationService.createNotification({
      title: "Important Announcement",
      message: message,
      type: type,
      id_user: candidate.id_user
    });
  }
};

exports.notifyAllCompanies = async (message, type = 'info') => {
  const companies = await userModel.getAllByRole('ENTREPRISE');
  
  for (const company of companies) {
    await notificationService.createNotification({
      title: "Platform Update",
      message: message,
      type: type,
      id_user: company.id_user
    });
  }
};
```

---

## 🎯 Use Cases by Notification Type

### **INFO Notifications (Blue)**
- Interview scheduled
- Application submitted
- Application status: pending
- Meeting link added
- Profile viewed

### **SUCCESS Notifications (Green)**
- Application accepted
- Company approved
- Job published
- Interview completed successfully
- Profile updated
- Certificate uploaded

### **WARNING Notifications (Amber)**
- Interview cancelled
- Application deadline approaching
- Company status about to expire
- Email verification needed
- Payment issue

### **ERROR Notifications (Red)**
- Application rejected
- Company rejected
- Job posting failed
- Interview failed to schedule
- Profile incomplete
- Payment failed

---

## 📱 Frontend Usage Examples

### In a Component - Get All Notifications:

```typescript
import { useGetNotificationsQuery } from '../store/api/notificationApi';

function NotificationsList() {
  const { data: notifications, isLoading } = useGetNotificationsQuery();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {notifications?.map(notif => (
        <div key={notif.id_notif}>
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
          <small>{new Date(notif.date).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
```

### In a Component - Mark All as Read:

```typescript
import { useMarkAllNotificationsReadMutation } from '../store/api/notificationApi';

function NotificationActions() {
  const [markAll, { isLoading }] = useMarkAllNotificationsReadMutation();
  
  const handleMarkAll = async () => {
    try {
      await markAll().unwrap();
      alert('All marked as read!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };
  
  return (
    <button onClick={handleMarkAll} disabled={isLoading}>
      Mark All as Read
    </button>
  );
}
```

### In a Component - After Action:

```typescript
async function submitApplicationForm(data) {
  try {
    const response = await applicationsApi.submit(data);
    
    // The server will automatically create a notification
    // So on the frontend, we just need to refresh the notifications
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    
    toast.success('Application submitted successfully!');
  } catch (error) {
    toast.error('Failed to submit application');
  }
}
```

---

## 🔔 Email Notifications (Future Enhancement)

If you want to send email notifications as well:

```javascript
// backend/src/services/email.service.js

exports.sendNotificationEmail = async (userId, notification) => {
  const user = await userModel.getById(userId);
  
  const emailContent = `
    <h2>${notification.title}</h2>
    <p>${notification.message}</p>
    <a href="${process.env.FRONTEND_URL}/notifications">View in App</a>
  `;
  
  await mailService.send({
    to: user.email,
    subject: notification.title,
    html: emailContent
  });
};

// Then call it when creating a notification
await notificationService.createNotification(data);
await emailService.sendNotificationEmail(data.id_user, data);
```

---

## 🚀 Best Practices

1. **Always include title and message**
   - Title: Brief 2-5 word summary
   - Message: Full context (100-200 chars)

2. **Use correct type**
   - INFO: General updates
   - SUCCESS: Positive outcomes
   - WARNING: Cautionary info
   - ERROR: Failed operations

3. **Include action details**
   - Job title when mentioning jobs
   - Company name when mentioning companies
   - Candidate name when notifying recruiters

4. **Timing considerations**
   - Send immediately for critical updates
   - Group bulk notifications
   - Avoid duplicate notifications

5. **User preferences (future)**
   - Allow users to choose notification types
   - Set quiet hours
   - Choose delivery method (in-app, email, SMS)

---

**Last Updated:** 2024-04-27  
**Version:** 1.0  
**Status:** ✅ Complete
