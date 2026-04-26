import { RootState } from '../index';

export const selectAllNotifications = (state: RootState) => state.notifications.items;
export const selectUnreadNotifications = (state: RootState) => state.notifications.unread;
export const selectUnreadCount = (state: RootState) => state.notifications.unread.length;
