"use client";

import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/hooks/use-notifications";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  return (
    <>
      <PageHeader
        title="お知らせ"
        action={
          <Button
            variant="outlined"
            onClick={() => markAllAsRead.mutateAsync()}
            disabled={markAllAsRead.isPending}
          >
            全て既読にする
          </Button>
        }
      />

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : !data?.items.length ? (
        <EmptyState title="お知らせはありません" />
      ) : (
        <Stack spacing={1}>
          {data.items.map((notification) => (
            <Paper
              key={notification.id}
              sx={{
                p: 2,
                cursor: !notification.is_read ? "pointer" : "default",
                ...(!notification.is_read && {
                  bgcolor: (theme) =>
                    alpha(theme.palette.primary.main, 0.04),
                  borderLeft: (theme) =>
                    `3px solid ${theme.palette.primary.main}`,
                }),
              }}
              onClick={() => {
                if (!notification.is_read) {
                  markAsRead.mutateAsync(notification.id);
                }
              }}
            >
              <Typography variant="subtitle2">
                {notification.title}
              </Typography>
              {notification.message && (
                <Typography variant="body2" color="textSecondary">
                  {notification.message}
                </Typography>
              )}
              <Typography variant="caption" color="textSecondary">
                {new Date(notification.created_at).toLocaleString("ja-JP")}
              </Typography>
            </Paper>
          ))}
        </Stack>
      )}
    </>
  );
}
