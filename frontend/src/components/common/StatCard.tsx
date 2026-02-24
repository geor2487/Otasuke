"use client";

import { ReactNode } from "react";
import NextLink from "next/link";
import { Box, Card, CardActionArea, CardContent, Typography } from "@mui/material";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  href?: string;
};

export default function StatCard({
  title,
  value,
  icon,
  color = "primary.main",
  href,
}: StatCardProps) {
  const content = (
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            color,
            fontSize: 40,
            opacity: 0.8,
            display: "flex",
            alignItems: "center",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  );

  if (href) {
    return (
      <Card>
        <CardActionArea component={NextLink} href={href}>
          {content}
        </CardActionArea>
      </Card>
    );
  }

  return <Card>{content}</Card>;
}
