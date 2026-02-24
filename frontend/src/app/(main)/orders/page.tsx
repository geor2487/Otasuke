"use client";

import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { PageHeader, EmptyState, StatusBadge } from "@/components/common";

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading } = useOrders();

  const title = user?.role === "contractor" ? "発注一覧" : "受注一覧";

  return (
    <>
      <PageHeader title={title} />

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : !data?.items.length ? (
        <EmptyState title="発注/受注はありません" />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {data.items.map((order) => (
            <Card key={order.id}>
              <CardActionArea
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      案件ID: {order.project_id}
                    </Typography>
                    <StatusBadge status={order.status} type="order" />
                  </Box>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    金額: ¥{order.amount.toLocaleString()}
                  </Typography>

                  <Typography variant="caption" color="textSecondary">
                    {new Date(order.created_at).toLocaleDateString("ja-JP")}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}
    </>
  );
}
