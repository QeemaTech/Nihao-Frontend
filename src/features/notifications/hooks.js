import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "./api";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 30_000, // Poll every 30 seconds
  });
}

export function useUnreadCount() {
  const { data } = useNotifications();
  if (!Array.isArray(data)) return 0;
  return data.filter((n) => !n.isRead).length;
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId) => markNotificationAsRead(notificationId),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const prev = queryClient.getQueryData(["notifications"]);
      queryClient.setQueryData(["notifications"], (old) =>
        Array.isArray(old)
          ? old.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
          : old
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(["notifications"], context.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const prev = queryClient.getQueryData(["notifications"]);
      queryClient.setQueryData(["notifications"], (old) =>
        Array.isArray(old) ? old.map((n) => ({ ...n, isRead: true })) : old
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(["notifications"], context.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
