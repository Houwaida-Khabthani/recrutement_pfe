# Notification System Setup Guide

## Quick Start

### Step 1: Backend Setup ✅
All backend files have been updated:
- ✅ `backend/src/modules/notifications/notification.model.js` - Extended with new methods
- ✅ `backend/src/modules/notifications/notification.service.js` - Complete service layer
- ✅ `backend/src/modules/notifications/notification.controller.js` - Full controller with error handling
- ✅ `backend/src/modules/notifications/notification.routes.js` - All API routes

No additional backend installation needed!

---

### Step 2: Frontend Installation

1. **Install `date-fns` package** (if not already installed):
```bash
cd frontend
npm install date-fns
```

2. **Verify axios is installed:**
```bash
npm list axios
```
*Should already be installed; if not:*
```bash
npm install axios
```

---

### Step 3: Verify Files Created ✅

#### Components:
- ✅ `frontend/src/components/notifications/NotificationBell.tsx` - Bell component with dropdown
- ✅ `frontend/src/pages/admin/Notifications.tsx` - Full notifications page
- ✅ `frontend/src/hooks/useNotifications.ts` - Custom notification hook

#### Routes:
- ✅ `frontend/src/routes/AppRoutes.tsx` - Updated with `/admin/notifications` route

#### Integration:
- ✅ `frontend/src/pages/admin/AdminLayout.tsx` - NotificationBell integrated in header

---

### Step 4: Database Verification

The notification table should exist with columns:
```sql
- id_notif (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
- message (VARCHAR 500)
- type (ENUM: success, error, warning, info)
- lu (TINYINT, 0=unread, 1=read)
- date (TIMESTAMP)
- id_user (INTEGER, FOREIGN KEY)
```

**If table doesn't exist, run:**
```sql
CREATE TABLE notification (
  id_notif INT PRIMARY KEY AUTO_INCREMENT,
  message VARCHAR(500) NOT NULL,
  type ENUM('success', 'error', 'warning', 'info') DEFAULT 'info',
  lu TINYINT DEFAULT 0,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_user INT NOT NULL,
  FOREIGN KEY (id_user) REFERENCES user(id) ON DELETE CASCADE,
  INDEX (id_user, lu),
  INDEX (date)
);
```

---

### Step 5: Test the System

#### 1. Start Backend & Frontend:
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

#### 2. Create Test Notifications:
```javascript
// In browser console or using Admin API
const token = localStorage.getItem('token');

// Create a notification
fetch('http://localhost:5000/api/notifications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Test notification',
    type: 'success',
    id_user: 5  // Replace with actual admin user ID
  })
})
.then(r => r.json())
.then(console.log);
```

#### 3. Test in UI:
1. Log in as Admin
2. Click the **Bell icon** in the navbar
3. Should see notifications dropdown
4. Click a notification to mark as read
5. Click **Mark all** to mark all as read
6. Click **View all** to go to `/admin/notifications`

---

## Usage Examples

### Using NotificationBell in Components

```tsx
import NotificationBell from '@/components/notifications/NotificationBell';

export const MyHeader = () => {
  return (
    <header>
      <h1>Dashboard</h1>
      <NotificationBell userId={5} />  {/* Pass user ID */}
    </header>
  );
};
```

### Using useNotifications Hook

```tsx
import { useNotifications } from '@/hooks/useNotifications';

export const MyComponent = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  return (
    <div>
      <h2>Unread: {unreadCount}</h2>
      {notifications.map(notif => (
        <div key={notif.id_notif}>
          <p>{notif.message}</p>
          <button onClick={() => markAsRead(notif.id_notif)}>
            Mark as read
          </button>
        </div>
      ))}
      <button onClick={markAllAsRead}>
        Clear All
      </button>
    </div>
  );
};
```

### Creating Notifications from Other Pages

```tsx
// Example: After approving a company
import { useNotifications } from '@/hooks/useNotifications';

const approveCompany = async (companyId) => {
  const { createNotification } = useNotifications();
  
  try {
    await api.post(`/companies/${companyId}/approve`);
    
    // Notify user
    await createNotification(
      `Company ${companyName} has been approved!`,
      'success'
    );
  } catch (error) {
    await createNotification(
      `Failed to approve company: ${error.message}`,
      'error'
    );
  }
};
```

---

## Features

### NotificationBell Component
- 🔔 Bell icon in navbar
- 🔴 Red badge with count
- 📋 Dropdown with latest 5 notifications
- ✅ Mark single as read
- ✨ Mark all as read
- 🔗 "View all" link
- 🔄 Auto-refresh every 30s
- 🌙 Dark mode support
- ✨ Smooth animations

### Notifications Page
- 📊 Full notification history
- 🔍 Filter: All / Unread
- 🎯 Type-based color coding
- ⏰ Formatted timestamps
- 📌 Status indicators
- 🎨 Modern card design
- 🔄 Real-time updates
- 🌙 Dark mode support

### useNotifications Hook
- 📡 Auto-polling (30s interval)
- 🔄 Refresh methods
- ✅ Mark as read logic
- 💾 Local state management
- 🚨 Error handling
- ⚡ Optimized performance

---

## API Endpoints Reference

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/notifications` | ✅ | Get all notifications |
| GET | `/api/notifications/recent` | ✅ | Get latest 5 + count |
| GET | `/api/notifications/unread-count` | ✅ | Get unread count |
| POST | `/api/notifications` | ❌ | Create notification |
| PUT | `/api/notifications/:id/read` | ✅ | Mark one as read |
| PUT | `/api/notifications/read-all` | ✅ | Mark all as read |

---

## Troubleshooting

### Bell Icon Not Showing
- Check that `date-fns` is installed: `npm list date-fns`
- Verify NotificationBell is imported in AdminLayout
- Check console for errors

### No Notifications Appearing
- Verify admin user ID in database
- Check that notification records exist in DB
- Check browser console for fetch errors
- Verify authorization token is set

### Dropdown Not Opening
- Clear browser cache
- Check for JavaScript errors in console
- Verify NotificationBell component mounted correctly
- Check that click handler is working

### Styling Issues
- Verify Tailwind CSS is configured
- Check that `dark:` classes work elsewhere
- Clear Tailwind cache: `npm run build`

### Database Connection Error
- Verify database connection in backend
- Check that notification table exists
- Run migration if needed
- Check user ID foreign key constraints

---

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── notifications/
│   │       └── NotificationBell.tsx ✨ NEW
│   ├── hooks/
│   │   └── useNotifications.ts ✨ NEW
│   ├── pages/
│   │   └── admin/
│   │       ├── AdminLayout.tsx (UPDATED)
│   │       └── Notifications.tsx ✨ NEW
│   └── routes/
│       └── AppRoutes.tsx (UPDATED)

backend/
└── src/
    └── modules/
        └── notifications/
            ├── notification.model.js (UPDATED)
            ├── notification.service.js (UPDATED)
            ├── notification.controller.js (UPDATED)
            └── notification.routes.js (UPDATED)

Documentation/
├── NOTIFICATION_SYSTEM_DOCS.md ✨ NEW
└── NOTIFICATION_SYSTEM_SETUP.md ✨ NEW (this file)
```

---

## Next Steps

1. **Install dependencies:** `npm install date-fns`
2. **Verify database table exists**
3. **Test the notification dropdown**
4. **Create test notifications via API**
5. **Integrate into your workflows** (company approvals, user actions, etc.)
6. **Monitor notifications page** for all activity

---

## Configuration

### Change Polling Interval
Edit `frontend/src/hooks/useNotifications.ts` line ~96:
```typescript
const interval = setInterval(fetchRecentNotifications, 30000); // 30s
// Change 30000 to desired milliseconds
```

### Change Recent Limit
Edit `backend/src/modules/notifications/notification.model.js` line ~16:
```javascript
exports.getRecentByUser = (id_user, limit = 5) => { // Change 5
```

### Customize Notification Types
Edit `backend/src/modules/notifications/notification.model.js` - ENUM field:
```sql
type ENUM('success', 'error', 'warning', 'info', 'custom')
```

---

## Support & Questions

Check the main documentation: `NOTIFICATION_SYSTEM_DOCS.md`

Common issues are documented in the Troubleshooting section above.
