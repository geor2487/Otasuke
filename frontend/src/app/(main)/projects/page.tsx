"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Pagination,
  TextField,
} from "@mui/material";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import FolderOutlined from "@mui/icons-material/FolderOutlined";
import PlayCircleOutlined from "@mui/icons-material/PlayCircleOutlined";
import AutorenewOutlined from "@mui/icons-material/AutorenewOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, EmptyState, StatCard } from "@/components/common";
import ProjectCard from "@/components/projects/ProjectCard";
import { useProjects } from "@/hooks/use-projects";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import type { ContractorDashboard } from "@/types";

const STATUS_OPTIONS = [
  { value: "", label: "全て" },
  { value: "draft", label: "下書き" },
  { value: "open", label: "募集中" },
  { value: "in_progress", label: "進行中" },
  { value: "completed", label: "完了" },
  { value: "cancelled", label: "キャンセル" },
] as const;

export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "";
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const { company } = useAuth();

  useEffect(() => {
    const s = searchParams.get("status") || "";
    setStatusFilter(s);
    setPage(1);
  }, [searchParams]);

  const { data, isLoading } = useProjects({
    status: statusFilter || undefined,
    company_id: company?.id,
    page,
    per_page: 20,
  });

  const { data: dashboard } = useQuery<ContractorDashboard>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/contractor");
      return data;
    },
    enabled: !!company,
  });

  return (
    <>
      <PageHeader
        title="案件管理"
        action={
          <Button
            component={Link}
            href="/projects/new"
            variant="contained"
            startIcon={<AddCircleOutline />}
          >
            新規案件作成
          </Button>
        }
      />

      {dashboard && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard
              title="全案件数"
              value={dashboard.total_projects}
              icon={<FolderOutlined fontSize="large" />}
              color="primary.main"
              href="/projects"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard
              title="募集中"
              value={dashboard.open_projects}
              icon={<PlayCircleOutlined fontSize="large" />}
              color="success.main"
              href="/projects?status=open"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard
              title="進行中"
              value={dashboard.in_progress_projects}
              icon={<AutorenewOutlined fontSize="large" />}
              color="info.main"
              href="/projects?status=in_progress"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard
              title="完了"
              value={dashboard.completed_projects}
              icon={<CheckCircleOutlined fontSize="large" />}
              color="primary.main"
              href="/projects?status=completed"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard
              title="発注数"
              value={dashboard.total_orders}
              icon={<ReceiptLongOutlined fontSize="large" />}
              color="secondary.main"
              href="/orders"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard
              title="保留中の見積もり"
              value={dashboard.pending_quotes}
              icon={<DescriptionOutlined fontSize="large" />}
              color="warning.main"
            />
          </Grid>
        </Grid>
      )}

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          select
          label="ステータス"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          size="small"
          sx={{ minWidth: 160 }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && (!data || data.items.length === 0) && (
        <EmptyState
          title="案件がありません"
          description="新しい案件を作成してください"
        />
      )}

      {!isLoading && data && data.items.length > 0 && (
        <>
          <Grid container spacing={2}>
            {data.items.map((project) => (
              <Grid key={project.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <ProjectCard project={project} />
              </Grid>
            ))}
          </Grid>

          {data.pages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={data.pages}
                page={page}
                onChange={(_e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </>
  );
}
