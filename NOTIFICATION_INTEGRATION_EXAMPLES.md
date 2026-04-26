# Notification System - Integration Examples

## Real-World Usage Scenarios

---

## 1. Company Approval/Rejection Notifications

### Scenario
When an admin approves or rejects a company, notify the company user.

### Implementation

**File:** `backend/src/modules/companies/company.controller.js`

```javascript
const companyService = require('./company.service');
const notificationService = require('../notifications/notification.service');

exports.approveCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const company = await companyService.getById(companyId);
    
    // Approve the company
    await companyService.updateStatus(companyId, 'approved');
    
    // Create notification for company user
    await notificationService.createNotification({
      message: `Your company "${company.nom}" has been approved! You can now post jobs.`,
      type: 'success',
      id_user: company.id_user
    });
    
    res.json({ success: true, message: 'Company approved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { reason } = req.body;
    
    const company = await companyService.getById(companyId);
    
    // Reject the company
    await companyService.updateStatus(companyId, 'rejected');
    
    // Create notification for company user
    await notificationService.createNotification({
      message: `Your company "${company.nom}" was rejected. Reason: ${reason}`,
      type: 'error',
      id_user: company.id_user
    });
    
    res.json({ success: true, message: 'Company rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## 2. User Registration Notifications

### Scenario
Notify admins when a new user registers.

### Implementation

**File:** `backend/src/modules/auth/auth.controller.js`

```javascript
const authService = require('./auth.service');
const notificationService = require('../notifications/notification.service');

exports.register = async (req, res) => {
  try {
    const { email, nom, role } = req.body;
    
    // Register user
    const newUser = await authService.register(req.body);
    
    // Get admin users (assuming id=1 is main admin)
    const admins = await authService.getAdmins();
    
    // Notify all admins
    for (const admin of admins) {
      await notificationService.createNotification({
        message: `New ${role} registration: ${nom} (${email})`,
        type: 'info',
        id_user: admin.id
      });
    }
    
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## 3. Job Application Activity Notifications

### Scenario
Notify admin when job applications are submitted or change status.

### Implementation

**File:** `backend/src/modules/applications/application.controller.js`

```javascript
const applicationService = require('./application.service');
const notificationService = require('../notifications/notification.service');
const jobService = require('../jobs/job.service');

exports.submitApplication = async (req, res) => {
  try {
    const { jobId, candidateId } = req.body;
    
    // Create application
    const application = await applicationService.create(req.body);
    
    // Get job details
    const job = await jobService.getById(jobId);
    
    // Get admin users
    const admins = await adminService.getAllAdmins();
    
    // Notify all admins
    for (const admin of admins) {
      await notificationService.createNotification({
        message: `New application for "${job.title}" position`,
        type: 'info',
        id_user: admin.id
      });
    }
    
    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    
    const application = await applicationService.getById(applicationId);
    
    // Update status
    await applicationService.updateStatus(applicationId, status);
    
    // Get candidate (applicant)
    const candidate = await candidateService.getById(application.id_candidate);
    
    // Create appropriate notification
    const statusMessages = {
      'accepted': `Great news! Your application for the job has been accepted.`,
      'rejected': `Your application has been reviewed. We regret to inform you it was not selected.`,
      'interview': `Congratulations! You've been selected for an interview.`,
      'pending': 'Your application is under review.'
    };
    
    const notificationType = {
      'accepted': 'success',
      'rejected': 'error',
      'interview': 'success',
      'pending': 'info'
    };
    
    // Notify candidate
    await notificationService.createNotification({
      message: statusMessages[status],
      type: notificationType[status],
      id_user: candidate.id_user
    });
    
    // Notify company
    const job = await jobService.getById(application.id_job);
    const company = await companyService.getById(job.id_company);
    
    await notificationService.createNotification({
      message: `Application status updated to "${status}" for candidate ${candidate.user.nom}`,
      type: 'info',
      id_user: company.id_user
    });
    
    res.json({ success: true, message: 'Application status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## 4. Using Notifications in Frontend Components

### Create Admin Dashboard Alert

**File:** `frontend/src/pages/admin/Dashboard.tsx`

```tsx
import { useNotifications } from '@/hooks/useNotifications';
import { AlertCircle } from 'lucide-react';

export const AdminDashboard = () => {
  const { unreadCount } = useNotifications();

  return (
    <div>
      {unreadCount > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <p className="text-blue-800 dark:text-blue-300">
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}. 
            <a href="/admin/notifications" className="font-semibold hover:underline ml-1">
              View
            </a>
          </p>
        </div>
      )}
      
      {/* Rest of dashboard */}
    </div>
  );
};
```

---

## 5. Bulk Operation Notifications

### Scenario
Notify users when bulk actions are completed.

### Implementation

**File:** `backend/src/modules/admin/admin.controller.js`

```javascript
const adminService = require('./admin.service');
const notificationService = require('../notifications/notification.service');

exports.bulkApproveCompanies = async (req, res) => {
  try {
    const { companyIds } = req.body;
    let approved = 0;
    let failed = 0;
    
    for (const companyId of companyIds) {
      try {
        const company = await adminService.approveCompany(companyId);
        
        // Notify company user
        await notificationService.createNotification({
          message: `Your company "${company.nom}" has been approved!`,
          type: 'success',
          id_user: company.id_user
        });
        
        approved++;
      } catch (error) {
        failed++;
      }
    }
    
    // Notify admin
    const adminId = req.user.id;
    await notificationService.createNotification({
      message: `Bulk approval completed: ${approved} approved, ${failed} failed`,
      type: approved > failed ? 'success' : 'warning',
      id_user: adminId
    });
    
    res.json({ 
      success: true, 
      message: `Approved ${approved} companies, ${failed} failed` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## 6. System Event Notifications

### Scenario
Notify admins about important system events.

### Implementation

**File:** `backend/src/utils/eventLogger.js`

```javascript
const notificationService = require('../modules/notifications/notification.service');

class EventLogger {
  async logSecurityEvent(eventType, details, adminId) {
    const messages = {
      'failed_login': `Security Alert: Failed login attempt - ${details.email}`,
      'new_admin': `New admin account created: ${details.name}`,
      'data_export': `Data export requested by admin: ${details.exportType}`,
      'bulk_delete': `Bulk deletion of ${details.count} records by admin`,
      'system_error': `System error: ${details.error}`
    };

    await notificationService.createNotification({
      message: messages[eventType] || 'System event occurred',
      type: eventType === 'system_error' ? 'error' : 'warning',
      id_user: adminId
    });
  }

  async logGlobalEvent(eventType, details) {
    // Notify all admins
    const admins = await adminService.getAllAdmins();
    
    for (const admin of admins) {
      await notificationService.createNotification({
        message: details.message,
        type: details.type || 'info',
        id_user: admin.id
      });
    }
  }
}

module.exports = new EventLogger();
```

---

## 7. Scheduled Task Notifications

### Scenario
Run scheduled jobs and notify admins of completion.

### Implementation

**File:** `backend/src/tasks/scheduledJobs.js`

```javascript
const cron = require('node-cron');
const notificationService = require('../modules/notifications/notification.service');
const reportService = require('../modules/reports/report.service');

// Run daily at 8 AM
cron.schedule('0 8 * * *', async () => {
  try {
    const adminId = 1; // Main admin
    
    // Generate daily report
    const report = await reportService.generateDailyReport();
    
    // Notify admin
    await notificationService.createNotification({
      message: `Daily report generated: ${report.stats.newUsers} new users, ${report.stats.newApplications} new applications`,
      type: 'success',
      id_user: adminId
    });
  } catch (error) {
    console.error('Scheduled job error:', error);
    
    // Notify admin of error
    await notificationService.createNotification({
      message: `Daily report job failed: ${error.message}`,
      type: 'error',
      id_user: 1
    });
  }
});
```

---

## 8. Email Notification Trigger

### Scenario
Send important notifications to multiple channels (dashboard + email).

### Implementation

**File:** `backend/src/utils/notificationDispatcher.js`

```javascript
const notificationService = require('../modules/notifications/notification.service');
const emailService = require('./emailService');

class NotificationDispatcher {
  async sendCritical(userId, message, type = 'warning') {
    // Send in-app notification
    await notificationService.createNotification({
      message,
      type,
      id_user: userId
    });
    
    // Get user email
    const user = await userService.getById(userId);
    
    // Send email for critical notifications
    if (type === 'error' || type === 'warning') {
      await emailService.send({
        to: user.email,
        subject: 'Important Notification from Admin Panel',
        template: 'notification',
        data: { message, type }
      });
    }
  }

  async notifyGroup(userIds, message, type = 'info') {
    // Send to multiple users
    for (const userId of userIds) {
      await notificationService.createNotification({
        message,
        type,
        id_user: userId
      });
    }
  }
}

module.exports = new NotificationDispatcher();
```

---

## 9. Real-time Notifications Context

### Scenario
Use notifications with React Context for global state.

### Implementation

**File:** `frontend/src/context/NotificationContext.tsx`

```tsx
import React, { createContext, useContext } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationContextType {
  unreadCount: number;
  notifications: any[];
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const notificationData = useNotifications();

  return (
    <NotificationContext.Provider value={notificationData}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};
```

**Usage in App.tsx:**
```tsx
import { NotificationProvider } from '@/context/NotificationContext';

<NotificationProvider>
  <AppRoutes />
</NotificationProvider>
```

---

## 10. Testing Notifications

### Backend Test Script

**File:** `backend/test-notifications.js`

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:5000';
const ADMIN_ID = 5; // Replace with actual admin ID
const TOKEN = 'your-jwt-token'; // Get from login

async function testNotifications() {
  try {
    // Test 1: Create notification
    console.log('✓ Creating test notification...');
    const createRes = await axios.post(`${API_URL}/api/notifications`, {
      message: 'Test notification',
      type: 'success',
      id_user: ADMIN_ID
    });
    console.log('✓ Created:', createRes.data);

    // Test 2: Get recent
    console.log('\n✓ Fetching recent notifications...');
    const recentRes = await axios.get(
      `${API_URL}/api/notifications/recent`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    console.log('✓ Found:', recentRes.data.data.length, 'notifications');

    // Test 3: Get unread count
    console.log('\n✓ Getting unread count...');
    const countRes = await axios.get(
      `${API_URL}/api/notifications/unread-count`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    console.log('✓ Unread count:', countRes.data.data.unreadCount);

    // Test 4: Mark as read
    if (recentRes.data.data.length > 0) {
      const notifId = recentRes.data.data[0].id_notif;
      console.log(`\n✓ Marking notification ${notifId} as read...`);
      const readRes = await axios.put(
        `${API_URL}/api/notifications/${notifId}/read`,
        {},
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );
      console.log('✓ Marked as read:', readRes.data);
    }

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testNotifications();
```

**Run tests:**
```bash
node backend/test-notifications.js
```

---

## Summary

You now have:
- ✅ Complete backend notification API
- ✅ Frontend components (bell + full page)
- ✅ Custom hook for easy integration
- ✅ Real-world integration examples
- ✅ Best practices and patterns
- ✅ Testing utilities

**Next:** Implement these examples in your specific workflows!
