# Notification System Documentation

## Overview
Complete notification system for Admin Dashboard with backend API and React frontend components.

---

## Backend API Endpoints

### 1. Get All Notifications
**Endpoint:** `GET /api/notifications`  
**Auth:** Required (Bearer Token)  
**Description:** Retrieve all notifications for the authenticated user, sorted by date (newest first).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_notif": 1,
      "message": "Company XYZ has been approved",
      "type": "success",
      "lu": 0,
      "date": "2026-04-17T10:30:00Z",
      "id_user": 5
    }
  ]
}
```

---

### 2. Get Recent Notifications
**Endpoint:** `GET /api/notifications/recent`  
**Auth:** Required (Bearer Token)  
**Description:** Get the latest 5 notifications with unread count.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_notif": 1,
      "message": "Company approved",
      "type": "success",
      "lu": 0,
      "date": "2026-04-17T10:30:00Z"
    }
  ],
  "unreadCount": 3
}
```

---

### 3. Get Unread Count
**Endpoint:** `GET /api/notifications/unread-count`  
**Auth:** Required (Bearer Token)  
**Description:** Get the number of unread notifications.

**Response:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 3
  }
}
```

---

### 4. Create Notification
**Endpoint:** `POST /api/notifications`  
**Auth:** Optional (for system notifications)  
**Description:** Create a new notification for a user.

**Request:**
```json
{
  "message": "New job application received",
  "type": "info",
  "id_user": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification created"
}
```

**Note Types:** `success`, `error`, `warning`, `info`

---

### 5. Mark Notification as Read
**Endpoint:** `PUT /api/notifications/:id/read`  
**Auth:** Required (Bearer Token)  
**Description:** Mark a single notification as read.

**Response:**
```json
{
  "success": true,
  "message": "Marked as read"
}
```

---

### 6. Mark All as Read
**Endpoint:** `PUT /api/notifications/read-all`  
**Auth:** Required (Bearer Token)  
**Description:** Mark all notifications as read for the current user.

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## Database Schema

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

## Frontend Components

### NotificationBell Component
**Location:** `src/components/notifications/NotificationBell.tsx`

**Props:**
```typescript
interface NotificationBellProps {
  userId?: number;
}
```

**Features:**
- Bell icon with unread badge
- Dropdown panel with latest 5 notifications
- Mark as read functionality
- Mark all as read button
- "View all" link
- Auto-refresh every 30 seconds
- Dark mode support
- Smooth animations

**Usage:**
```tsx
import NotificationBell from '@/components/notifications/NotificationBell';

<NotificationBell userId={user.id} />
```

---

### Notifications Page Component
**Location:** `src/pages/admin/Notifications.tsx`

**Features:**
- Full list of all notifications
- Filter: All / Unread
- Mark individual notifications as read
- Mark all as read
- Status indicators
- Type badges with colors
- Formatted timestamps
- Empty state
- Dark mode support

**Access:** `/admin/notifications`

---

### useNotifications Hook
**Location:** `src/hooks/useNotifications.ts`

**Returns:**
```typescript
{
  notifications: Notification[];        // Array of notifications
  unreadCount: number;                 // Count of unread notifications
  loading: boolean;                    // Loading state
  error: string | null;                // Error message if any
  fetchNotifications: () => Promise<void>;  // Get all notifications
  fetchRecentNotifications: () => Promise<void>;  // Get recent 5
  markAsRead: (id: number) => Promise<void>;  // Mark one as read
  markAllAsRead: () => Promise<void>;  // Mark all as read
  createNotification: (msg, type) => Promise<void>;  // Create notification
}
```

**Usage:**
```tsx
import { useNotifications } from '@/hooks/useNotifications';

const MyComponent = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  return (
    <>
      <p>Unread: {unreadCount}</p>
      {notifications.map(notif => (
        <div onClick={() => markAsRead(notif.id_notif)}>
          {notif.message}
        </div>
      ))}
    </>
  );
};
```

---

## Color Coding

| Type | Color | Hex |
|------|-------|-----|
| success | Green | #10B981 |
| error | Red | #EF4444 |
| warning | Amber | #F59E0B |
| info | Blue | #3B82F6 |

---

## Example: Creating Notifications Programmatically

### Using the Hook
```typescript
const { createNotification } = useNotifications();

// Create success notification
await createNotification('Company approved successfully', 'success');

// Create error notification
await createNotification('Failed to update company', 'error');

// Create warning notification
await createNotification('Company pending approval', 'warning');

// Create info notification
await createNotification('New application received', 'info');
```

### Using Axios Directly
```typescript
import axios from 'axios';

await axios.post('/api/notifications', {
  message: 'User profile updated',
  type: 'success',
  id_user: 5
});
```

---

## Integration with AdminLayout

The NotificationBell component is integrated in `AdminLayout.tsx`:

```tsx
import NotificationBell from '../../components/notifications/NotificationBell';

// In the header:
<NotificationBell userId={user?.id} />
```

---

## Styling

All components use Tailwind CSS with:
- `dark:` prefixes for dark mode support
- Responsive design
- Smooth transitions and animations
- Color-coded types
- Accessibility considerations

---

## Auto-Polling

- NotificationBell polls for new notifications every **30 seconds**
- useNotifications hook automatically sets up polling
- Interval is cleaned up on component unmount

---

## Error Handling

All API calls include error handling:
- Network errors logged to console
- User-friendly error messages
- Graceful fallbacks
- Error state accessible via hook

---

## Performance Considerations

1. **Latest 5 limit** in dropdown to reduce payload
2. **Polling interval** set to 30 seconds (configurable)
3. **Indexed database queries** on user and read status
4. **Local state updates** for instant UI feedback
5. **Memoized callbacks** in useNotifications hook

---

## Future Enhancements

- [ ] WebSocket real-time notifications
- [ ] Notification preferences/settings
- [ ] Category filtering (approvals, rejections, etc.)
- [ ] Notification archiving
- [ ] Email notification integration
- [ ] Bulk operations (delete multiple)
- [ ] Notification history
- [ ] Search within notifications

---

## Testing

### Test Notification Creation
```bash
curl -X POST http://localhost:5000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test notification",
    "type": "info",
    "id_user": 5
  }'
```

### Test Mark as Read
```bash
curl -X PUT http://localhost:5000/api/notifications/1/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Mark All as Read
```bash
curl -X PUT http://localhost:5000/api/notifications/read-all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Support

For issues or questions, check:
1. Console logs for error messages
2. Backend server logs
3. Network tab in browser dev tools
4. Database for notification records
