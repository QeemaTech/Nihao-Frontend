import client from "../../api/client";
import endpoints from "../../api/endpoints";

export async function fetchNotifications() {
  const response = await client.get(endpoints.notifications);
  const data = response?.data?.data;
  return Array.isArray(data) ? data : [];
}

export async function markNotificationAsRead(notificationId) {
  const response = await client.patch(`${endpoints.notifications}/${notificationId}/read`);
  return response?.data?.data;
}

export async function markAllNotificationsAsRead() {
  const response = await client.patch(`${endpoints.notifications}/read-all`);
  return response?.data?.data;
}
