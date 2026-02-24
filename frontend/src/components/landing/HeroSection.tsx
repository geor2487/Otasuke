"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { SearchOutlined } from "@mui/icons-material";
import { useSpecialties } from "@/hooks/use-companies";

export default function HeroSection() {
  const router = useRouter();
  const { data: specialties } = useSpecialties();
  const [specialtyId, setSpecialtyId] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (specialtyId) params.set("specialty_id", specialtyId);
    if (location) params.set("location", location);
    router.push(`/browse${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#212121",
        color: "#FFFFFF",
        pt: { xs: 3, md: 4 },
        pb: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="md" sx={{ textAlign: "center" }}>
        <Box
          component="img"
          src="/logo.png"
          alt="おたすけくん"
          sx={{
            maxWidth: { xs: 1080, md: 1500 },
            width: "100%",
            height: "auto",
            my: "-18%",
          }}
        />
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            mb: 1.5,
            fontSize: { xs: "1.75rem", md: "2.5rem" },
          }}
        >
          建設業界の
          <Box component="span" sx={{ color: "#F26522" }}>
            最適なパートナー
          </Box>
          を見つけよう
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: "grey.400", mb: 2, fontWeight: 400 }}
        >
          元請けと下請けをつなぐマッチングプラットフォーム
        </Typography>

        {/* Search bar */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            justifyContent: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 2,
            p: 2,
          }}
        >
          <TextField
            id="hero-specialty"
            select
            label="専門分野"
            value={specialtyId}
            onChange={(e) => setSpecialtyId(e.target.value)}
            size="small"
            sx={{ minWidth: 180, flex: "1 1 180px" }}
          >
            <MenuItem value="">全て</MenuItem>
            {specialties?.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            id="hero-location"
            label="エリア"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            size="small"
            sx={{ minWidth: 160, flex: "1 1 160px" }}
          />

          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchOutlined />}
            onClick={handleSearch}
            sx={{ minWidth: 120, fontWeight: 700 }}
          >
            検索
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
