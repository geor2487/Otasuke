"use client";

import { useState } from "react";
import { Box } from "@mui/material";
import { useAuth } from "@/hooks/use-auth";
import PublicHeader from "@/components/layouts/PublicHeader";
import PublicFooter from "@/components/layouts/PublicFooter";
import AppSidebar from "@/components/layouts/AppSidebar";
import AppHeader from "@/components/layouts/AppHeader";
import { MINI_WIDTH } from "@/components/layouts/AppSidebar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Authenticated: show sidebar layout (same as main layout but without AuthGuard)
  if (!isLoading && isAuthenticated) {
    return (
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
    );
  }

  // Not authenticated: public layout with header + footer
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <PublicHeader />
      <Box component="main" sx={{ mt: "64px", flex: 1 }}>
        {children}
      </Box>
      <PublicFooter />
    </Box>
  );
}
