"use client";

import { useParams } from "next/navigation";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import { useProject } from "@/hooks/use-projects";
import { StatusBadge } from "@/components/common";
import QuoteCTA from "@/components/projects/QuoteCTA";

export default function PublicProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, error } = useProject(id);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !project) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          案件情報の取得に失敗しました。再度お試しください。
        </Alert>
      </Container>
    );
  }

  const budgetDisplay =
    project.budget_min != null || project.budget_max != null
      ? `${project.budget_min?.toLocaleString() ?? "---"}円 〜 ${project.budget_max?.toLocaleString() ?? "---"}円`
      : "予算未定";

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Project info */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
          {project.title}
        </Typography>
        <StatusBadge status={project.status} />
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          {project.description && (
            <Typography variant="body1" sx={{ mb: 3, whiteSpace: "pre-wrap" }}>
              {project.description}
            </Typography>
          )}

          <Grid container spacing={2}>
            {project.location && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  場所
                </Typography>
                <Typography variant="body2">{project.location}</Typography>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                予算
              </Typography>
              <Typography variant="body2">{budgetDisplay}</Typography>
            </Grid>

            {project.deadline && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  期限
                </Typography>
                <Typography variant="body2">
                  {new Date(project.deadline).toLocaleDateString("ja-JP")}
                </Typography>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                投稿日
              </Typography>
              <Typography variant="body2">
                {new Date(project.created_at).toLocaleDateString("ja-JP")}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Quote CTA */}
      <QuoteCTA projectId={project.id} projectStatus={project.status} />
    </Container>
  );
}
