"use client";

import { ReactNode } from "react";
import { Box, Typography } from "@mui/material";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
};

export default function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: "center", py: 8 }}>
      {icon && (
        <Box sx={{ color: "text.secondary", mb: 2, fontSize: 64, display: "flex", justifyContent: "center" }}>
          {icon}
        </Box>
      )}
      <Typography variant="h6">{title}</Typography>
      {description && (
        <Typography variant="body2" color="textSecondary">
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Box>
  );
}
