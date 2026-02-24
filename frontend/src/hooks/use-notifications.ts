"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import api from "@/lib/api";
import type { NotificationListResponse } from "@/types";

// ---------------------------------------------------------------------------
// Fetch notifications
// ---------------------------------------------------------------------------

export function useNotifications(unreadOnly?: boolean) {
  return useQuery<NotificationListResponse>({
    queryKey: ["notifications", { unreadOnly }],
    queryFn: async () => {
      const { data } = await api.get<NotificationListResponse>(
        "/notifications",
        { params: { unread_only: unreadOnly } },
      );
      return data;
    },
    refetchInterval: 30000,
  });
}

// ---------------------------------------------------------------------------
// Mark single notification as read
// ---------------------------------------------------------------------------

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (notificationId: string) => {
      await api.post(`/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Mark all notifications as read
// ---------------------------------------------------------------------------

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await api.post("/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
