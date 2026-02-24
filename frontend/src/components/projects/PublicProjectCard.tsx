"use client";

import NextLink from "next/link";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import { PlaceOutlined } from "@mui/icons-material";
import { StatusBadge } from "@/components/common";
import type { ProjectResponse } from "@/types";

type PublicProjectCardProps = {
  project: ProjectResponse;
};

export default function PublicProjectCard({ project }: PublicProjectCardProps) {
  const budgetDisplay =
    project.budget_min != null || project.budget_max != null
      ? `${project.budget_min?.toLocaleString() ?? "---"}円 〜 ${project.budget_max?.toLocaleString() ?? "---"}円`
      : "予算未定";

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardActionArea
        component={NextLink}
        href={`/browse/${project.id}`}
        sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <CardContent sx={{ flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 1,
            }}
          >
            <Typography variant="h6" sx={{ flex: 1, mr: 1 }}>
              {project.title}
            </Typography>
            <StatusBadge status={project.status} />
          </Box>

          {project.location && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
              <PlaceOutlined sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {project.location}
              </Typography>
            </Box>
          )}

          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            {budgetDisplay}
          </Typography>

          {project.deadline && (
            <Chip
              label={`期限: ${new Date(project.deadline).toLocaleDateString("ja-JP")}`}
              size="small"
              variant="outlined"
              sx={{ mr: 1 }}
            />
          )}

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            投稿日: {new Date(project.created_at).toLocaleDateString("ja-JP")}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
