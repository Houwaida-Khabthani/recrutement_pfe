# Notification System - Quick Testing Guide

## 🚀 Quick Start

### Step 1: Run Database Migration

Run the migration SQL to add the necessary fields to the notification table:

```bash
cd backend/database

# Windows (MySQL GUI or Command Line)
mysql -u root -p pfe_recruitment < migrate-notifications-enhancement.sql

# Or use your MySQL client of choice
```

### Step 2: Restart Backend Server

```bash
cd backend
npm run dev
```

### Step 3: No Frontend Changes Needed!
The frontend is already set up and ready to go.

---

## 📋 Test Scenarios

### Scenario 1: Manual Notification Creation

Create a test notification using curl or Postman:

```bash
# 1. Get your JWT token from login

# 2. Create a test notification (as admin or automated system)
curl -X POST http://localhost:5000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "message": "This is a test notification to verify the system works correctly",
    "type": "info",
    "id_user": 1
  }'
```

### Scenario 2: Using the UI

#### Test Mark All as Read:

1. **Make sure there are unread notifications**
   - Navigate to `/notifications` page
   - You should see a "Tout marquer comme lu" button at the top

2. **Click the button**
   - All unread notifications should change from colored background to white
   - Button should disappear

3. **Verify on bell icon**
   - Unread count should become 0
   - Bell should no longer show a badge

#### Test Individual Mark as Read:

1. On `/notifications` page
2. Find an unread notification (has colored background and button)
3. Click "Marquer comme lu" button
4. Notification background should turn white

#### Test Navigation:

1. Click bell icon in navbar
2. You should see recent notifications in dropdown
3. Click "Voir toutes les notifications" link
4. Should navigate to `/notifications` page

---

## 🧪 Automated Testing Script

Create a test file to generate multiple notifications:

```bash
# backend/test-notifications.js

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const TOKEN = 'YOUR_JWT_TOKEN'; // Get from login

async function testNotifications() {
  try {
    // Create multiple test notifications
    const types = ['info', 'success', 'warning', 'error'];
    
    for (let i = 0; i < 10; i++) {
      const type = types[i % types.length];
      
      const response = await axios.post(
        `${API_BASE}/notifications`,
        {
          title: `Test Notification ${i + 1}`,
          message: `This is test notification number ${i + 1} with type: ${type}`,
          type: type,
          id_user: 1
        },
        {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`✓ Created notification ${i + 1}`);
    }
    
    // Get all notifications
    const notifs = await axios.get(
      `${API_BASE}/notifications`,
      {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      }
    );
    
    console.log(`✓ Total notifications: ${notifs.data.data.length}`);
    console.log(`✓ Unread: ${notifs.data.data.filter(n => n.lu === 0).length}`);
    
    // Test mark all as read
    await axios.put(
      `${API_BASE}/notifications/read-all`,
      {},
      {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      }
    );
    
    console.log(`✓ Marked all as read`);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testNotifications();
```

Run with: `node test-notifications.js`

---

## ✅ Verification Checklist

### Backend Checks:

- [ ] Database migration ran without errors
- [ ] `notification` table has `title` and `created_at` columns
- [ ] Indexes created on `created_at` and `user_status`
- [ ] Notification routes registered in `/api`
- [ ] Test notification created successfully

### Frontend Checks:

- [ ] Bell icon appears in navbar
- [ ] Unread count badge shows correctly
- [ ] Clicking bell opens dropdown
- [ ] Recent notifications display in dropdown
- [ ] `/notifications` page loads
- [ ] Color coding works (blue, green, red, amber)
- [ ] "Tout marquer comme lu" button present
- [ ] Clicking mark all changes colors
- [ ] Individual mark as read works

### API Checks:

- [ ] `GET /api/notifications` returns all notifications
- [ ] `GET /api/notifications/recent` returns top 5 + count
- [ ] `PUT /api/notifications/read-all` marks all as read
- [ ] `PUT /api/notifications/:id/read` marks single as read
- [ ] Response includes unread count

### Socket.io Checks:

- [ ] Connection succeeds (check browser console)
- [ ] Real-time notifications appear when created
- [ ] Badge updates in real-time

---

## 🐛 Debugging Tips

### Check Database:

```sql
-- View notification table structure
DESCRIBE notification;

-- View all notifications for a user
SELECT * FROM notification WHERE id_user = 1 ORDER BY created_at DESC;

-- Count unread
SELECT COUNT(*) FROM notification WHERE id_user = 1 AND lu = 0;
```

### Check Logs:

**Backend Console:**
- Watch for notification creation/update logs
- Check for Socket.io connection messages

**Browser Console:**
- F12 → Console tab
- Look for Socket.io connection messages
- Check for any API errors (red text)

**Network Tab:**
- Monitor API calls to `/api/notifications`
- Check response payloads

---

## 🔄 Common Issues & Solutions

### Issue: "Unread count not updating"
**Solution:**
1. Clear browser cache
2. Check token is valid
3. Verify API response includes `unreadCount`

### Issue: "Button not showing"
**Solution:**
1. Make sure `unreadCount > 0`
2. Check notifications array is not empty
3. Verify `lu` field is 0 for unread

### Issue: "Mark all not working"
**Solution:**
1. Check PUT endpoint exists: `/notifications/read-all`
2. Verify auth middleware is working
3. Check network tab for error response

### Issue: "Notifications not appearing"
**Solution:**
1. Run database migration first
2. Restart backend server
3. Create a notification manually via API
4. Check if notification appears in database

---

## 📊 Test Data Example

```json
{
  "title": "New Application Received",
  "message": "You have received a new application for Senior Developer position",
  "type": "info",
  "id_user": 1,
  "created_at": "2024-04-27T10:30:00Z",
  "lu": 0
}
```

---

## 🎯 Performance Testing

Test with multiple notifications:

```bash
# Create 100 notifications to test performance
for i in {1..100}; do
  curl -X POST http://localhost:5000/api/notifications \
    -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"Test $i\",\"message\":\"Message $i\",\"type\":\"info\",\"id_user\":1}"
done
```

---

## 📝 Notes

- Default sorting: Newest first (`created_at DESC`)
- Pagination not yet implemented (consider for future)
- Real-time updates via Socket.io working
- Notifications are user-specific (based on JWT token)
- Supports 4 types: info, success, warning, error

---

**Status:** ✅ Ready for Testing
**Last Updated:** 2024-04-27
