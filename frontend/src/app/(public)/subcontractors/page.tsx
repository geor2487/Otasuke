"use client";

import { useState, useCallback } from "react";
import {
  Box,
  CircularProgress,
  Container,
  Grid,
  Pagination,
  Typography,
} from "@mui/material";
import SubcontractorCard from "@/components/subcontractors/SubcontractorCard";
import SubcontractorFilterBar from "@/components/subcontractors/SubcontractorFilterBar";
import { useSubcontractors } from "@/hooks/use-subcontractors";

export default function SubcontractorsPage() {
  const [specialtyId, setSpecialtyId] = useState("");
  const [location, setLocation] = useState("");
  const [keyword, setKeyword] = useState("");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const [appliedFilters, setAppliedFilters] = useState<{
    specialty_id?: string;
    location?: string;
    keyword?: string;
    min_rating?: number;
  }>({});

  const { data, isLoading } = useSubcontractors({
    ...appliedFilters,
    page,
    per_page: 12,
  });

  const handleSearch = useCallback(() => {
    setPage(1);
    setAppliedFilters({
      specialty_id: specialtyId || undefined,
      location: location || undefined,
      keyword: keyword || undefined,
      min_rating: minRating ?? undefined,
    });
  }, [specialtyId, location, keyword, minRating]);

  const totalPages = data ? Math.ceil(data.total / 12) : 0;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        業者を探す
      </Typography>

      <Grid container spacing={3}>
        {/* Left filter sidebar */}
        <Grid
          size={{ xs: 12, md: 4, lg: 3 }}
          sx={{ display: { xs: "none", md: "block" } }}
        >
          <Box sx={{ position: "sticky", top: 24 }}>
            <SubcontractorFilterBar
              specialtyId={specialtyId}
              onSpecialtyChange={setSpecialtyId}
              location={location}
              onLocationChange={setLocation}
              keyword={keyword}
              onKeywordChange={setKeyword}
              minRating={minRating}
              onMinRatingChange={setMinRating}
              onSearch={handleSearch}
            />
          </Box>
        </Grid>

        {/* Mobile filter */}
        <Grid size={{ xs: 12 }} sx={{ display: { xs: "block", md: "none" } }}>
          <SubcontractorFilterBar
            specialtyId={specialtyId}
            onSpecialtyChange={setSpecialtyId}
            location={location}
            onLocationChange={setLocation}
            keyword={keyword}
            onKeywordChange={setKeyword}
            minRating={minRating}
            onMinRatingChange={setMinRating}
            onSearch={handleSearch}
          />
        </Grid>

        {/* Right content */}
        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          {data && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              {data.total}件の業者が見つかりました
            </Typography>
          )}

          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          )}

          {!isLoading && (!data || data.items.length === 0) && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ py: 8, textAlign: "center" }}
            >
              条件に一致する業者が見つかりませんでした
            </Typography>
          )}

          {!isLoading && data && data.items.length > 0 && (
            <>
              <Grid container spacing={2}>
                {data.items.map((company) => (
                  <Grid key={company.id} size={{ xs: 12, sm: 6 }}>
                    <SubcontractorCard company={company} />
                  </Grid>
                ))}
              </Grid>

              {totalPages > 1 && (
                <Box
                  sx={{ display: "flex", justifyContent: "center", mt: 3 }}
                >
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_e, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
