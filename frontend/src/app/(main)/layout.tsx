"use client";

import { useState } from "react";
import { Box } from "@mui/material";
import AuthGuard from "@/components/auth/AuthGuard";
import AppSidebar from "@/components/layouts/AppSidebar";
import AppHeader from "@/components/layouts/AppHeader";
import { MINI_WIDTH } from "@/components/layouts/AppSidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGuard>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <AppSidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
        <AppHeader
          onMenuClick={() => setMobileOpen((prev) => !prev)}
        />

        <Box
          component="main"
          sx={{
            ml: { md: `${MINI_WIDTH}px` },
            mt: "64px",
            p: 3,
            minHeight: "calc(100vh - 64px)",
            backgroundColor: "background.default",
            width: { xs: "100%", md: `calc(100% - ${MINI_WIDTH}px)` },
          }}
        >
          {children}
        </Box>
      </Box>
    </AuthGuard>
  );
}
