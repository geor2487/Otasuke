"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  CircularProgress,
  Container,
  Grid,
  Pagination,
  Typography,
} from "@mui/material";
import SearchFilterBar from "@/components/search/SearchFilterBar";
import PublicProjectCard from "@/components/projects/PublicProjectCard";
import { EmptyState } from "@/components/common";
import { useProjects } from "@/hooks/use-projects";

const SIDEBAR_WIDTH = 340;

function BrowseContent() {
  const searchParams = useSearchParams();

  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [specialtyId, setSpecialtyId] = useState(
    searchParams.get("specialty_id") ?? "",
  );
  const [page, setPage] = useState(1);

  // Applied filters (only update on search click)
  const [appliedLocation, setAppliedLocation] = useState(location);
  const [appliedSpecialtyId, setAppliedSpecialtyId] = useState(specialtyId);

  const handleSearch = useCallback(() => {
    setAppliedLocation(location);
    setAppliedSpecialtyId(specialtyId);
    setPage(1);
  }, [location, specialtyId]);

  // Auto-search on initial load with URL params
  useEffect(() => {
    if (searchParams.get("location") || searchParams.get("specialty_id")) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, isLoading } = useProjects({
    status: "open",
    location: appliedLocation || undefined,
    specialty_id: appliedSpecialtyId || undefined,
    page,
    per_page: 12,
  });

  return (
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, md: 3 } }}>
      <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
        {/* Left sidebar - filter panel */}
        <Box
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            display: { xs: "none", md: "block" },
          }}
        >
          <SearchFilterBar
            location={location}
            onLocationChange={setLocation}
            specialtyId={specialtyId}
            onSpecialtyChange={setSpecialtyId}
            onSearch={handleSearch}
          />
        </Box>

        {/* Main content - results */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Mobile filter (shown on small screens) */}
          <Box sx={{ display: { xs: "block", md: "none" }, mb: 3 }}>
            <SearchFilterBar
              location={location}
              onLocationChange={setLocation}
              specialtyId={specialtyId}
              onSpecialtyChange={setSpecialtyId}
              onSearch={handleSearch}
            />
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            案件を探す
          </Typography>

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : !data?.items.length ? (
            <EmptyState
              title="募集中の案件はありません"
              description="条件を変更して再検索してください"
            />
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {data.total}件の案件が見つかりました
              </Typography>

              <Grid container spacing={2}>
                {data.items.map((project) => (
                  <Grid key={project.id} size={{ xs: 12, sm: 6 }}>
                    <PublicProjectCard project={project} />
                  </Grid>
                ))}
              </Grid>

              {data.pages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
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
        </Box>
      </Box>
    </Container>
  );
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      }
    >
      <BrowseContent />
    </Suspense>
  );
}
