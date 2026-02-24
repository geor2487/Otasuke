"use client";

import { useState } from "react";
import NextLink from "next/link";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { PageHeader, EmptyState, StatusBadge } from "@/components/common";
import { useDirectOrders } from "@/hooks/use-direct-orders";
import { useAuth } from "@/hooks/use-auth";
import type { DirectOrderResponse } from "@/types";

const TABS = [
  { label: "全て", value: "" },
  { label: "承認待ち", value: "pending" },
  { label: "承認済み", value: "accepted" },
  { label: "進行中", value: "in_progress" },
  { label: "完了", value: "completed" },
];

function DirectOrderCard({ order }: { order: DirectOrderResponse }) {
  const { user } = useAuth();
  const isContractor = user?.role === "contractor";

  return (
    <Card sx={{ mb: 1.5 }}>
      <CardActionArea
        component={NextLink}
        href={`/direct-orders/${order.id}`}
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
            <Typography variant="subtitle1" fontWeight={700}>
              {order.title}
            </Typography>
            <StatusBadge status={order.status} type="direct_order" />
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {isContractor ? "発注先" : "発注元"}:{" "}
              {isContractor
                ? order.subcontractor_company_name
                : order.contractor_company_name}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {order.amount.toLocaleString()}円
            </Typography>
            {order.deadline && (
              <Typography variant="body2" color="text.secondary">
                納期: {new Date(order.deadline).toLocaleDateString("ja-JP")}
              </Typography>
            )}
            {order.specialty_name && (
              <Chip label={order.specialty_name} size="small" variant="outlined" />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function DirectOrdersPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("");
  const { data, isLoading } = useDirectOrders(tab || undefined);

  const isContractor = user?.role === "contractor";
  const title = isContractor ? "直接発注一覧" : "直接受注一覧";

  return (
    <>
      <PageHeader title={title} />

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_e, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {TABS.map((t) => (
            <Tab key={t.value} label={t.label} value={t.value} />
          ))}
        </Tabs>
      </Box>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && (!data || data.items.length === 0) && (
        <EmptyState
          title={
            isContractor
              ? "直接発注がありません"
              : "直接受注がありません"
          }
          description={
            isContractor
              ? "業者を探すページから直接発注できます"
              : "元請けからの直接発注がここに表示されます"
          }
        />
      )}

      {!isLoading &&
        data &&
        data.items.map((order) => (
          <DirectOrderCard key={order.id} order={order} />
        ))}
    </>
  );
}
