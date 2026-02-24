"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useMyQuotes } from "@/hooks/use-quotes";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import StatusBadge from "@/components/common/StatusBadge";

const TAB_OPTIONS = [
  { value: "all", label: "全て" },
  { value: "submitted", label: "提出済み" },
  { value: "accepted", label: "採用" },
  { value: "rejected", label: "不採用" },
] as const;

type TabValue = (typeof TAB_OPTIONS)[number]["value"];

export default function QuotesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabValue>("all");
  const { data, isLoading } = useMyQuotes();

  const filtered = useMemo(() => {
    if (!data?.items) return [];
    if (tab === "all") return data.items;
    return data.items.filter((q) => q.status === tab);
  }, [data, tab]);

  return (
    <>
      <PageHeader title="見積もり一覧" />

      <Tabs
        value={tab}
        onChange={(_e, v: TabValue) => setTab(v)}
        sx={{ mb: 3 }}
      >
        {TAB_OPTIONS.map((opt) => (
          <Tab key={opt.value} value={opt.value} label={opt.label} />
        ))}
      </Tabs>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : !filtered.length ? (
        <EmptyState
          title="見積もりはありません"
          description="案件を探して見積もりを提出してください"
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filtered.map((quote) => (
            <Card key={quote.id}>
              <CardActionArea
                onClick={() => router.push(`/projects/${quote.project_id}`)}
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
                      案件ID: {quote.project_id}
                    </Typography>
                    <StatusBadge status={quote.status} type="quote" />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 3,
                      flexWrap: "wrap",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">
                      金額: ¥{quote.amount.toLocaleString()}
                    </Typography>
                    {quote.estimated_days != null && (
                      <Typography variant="body2">
                        工期: {quote.estimated_days}日
                      </Typography>
                    )}
                  </Box>

                  {quote.message && (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        mb: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {quote.message}
                    </Typography>
                  )}

                  <Typography variant="caption" color="textSecondary">
                    {new Date(quote.created_at).toLocaleDateString("ja-JP")}
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
