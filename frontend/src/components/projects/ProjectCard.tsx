"use client";

import { Box, Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/common";
import type { ProjectResponse } from "@/types";

type ProjectCardProps = {
  project: ProjectResponse;
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();

  const budgetDisplay =
    project.budget_min != null || project.budget_max != null
      ? `¥${project.budget_min?.toLocaleString() ?? "---"} - ¥${project.budget_max?.toLocaleString() ?? "---"}`
      : "予算未定";

  return (
    <Card>
      <CardActionArea onClick={() => router.push(`/projects/${project.id}`)}>
        <CardContent>
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
            <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
              {project.location}
            </Typography>
          )}

          <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", mb: 0.5 }}>
            <Typography variant="body2">{budgetDisplay}</Typography>
          </Box>

          <Typography variant="caption" color="textSecondary">
            {new Date(project.created_at).toLocaleDateString("ja-JP")}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
