"use client";

import { Box, Button, CircularProgress, Container, Grid, Typography } from "@mui/material";
import NextLink from "next/link";
import HeroSection from "@/components/landing/HeroSection";
import FeatureSection from "@/components/landing/FeatureSection";
import RoleCtaSection from "@/components/landing/RoleCtaSection";
import PublicProjectCard from "@/components/projects/PublicProjectCard";
import { useProjects } from "@/hooks/use-projects";

export default function LandingPage() {
  const { data, isLoading } = useProjects({
    status: "open",
    per_page: 6,
    page: 1,
  });

  return (
    <>
      {/* Hero */}
      <HeroSection />

      {/* Pickup projects */}
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            sx={{ fontWeight: 700, mb: 5 }}
          >
            募集中の案件ピックアップ
          </Typography>

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : data && data.items.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {data.items.map((project) => (
                  <Grid key={project.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <PublicProjectCard project={project} />
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ textAlign: "center", mt: 4 }}>
                <Button
                  component={NextLink}
                  href="/browse"
                  variant="outlined"
                  color="secondary"
                  size="large"
                >
                  もっと見る
                </Button>
              </Box>
            </>
          ) : (
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
            >
              現在募集中の案件はありません
            </Typography>
          )}
        </Container>
      </Box>

      {/* Features */}
      <FeatureSection />

      {/* Role CTA */}
      <RoleCtaSection />
    </>
  );
}
