"use client";

import NextLink from "next/link";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Rating,
  Typography,
} from "@mui/material";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import type { CompanyWithSpecialtiesResponse } from "@/types";

type Props = {
  company: CompanyWithSpecialtiesResponse;
};

export default function SubcontractorCard({ company }: Props) {
  return (
    <Card>
      <CardActionArea
        component={NextLink}
        href={`/companies/${company.id}`}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {company.name}
          </Typography>

          {company.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {company.description}
            </Typography>
          )}

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
            {company.specialties.map((s) => (
              <Chip
                key={s.id}
                label={s.name}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            {company.address && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <LocationOnOutlined
                  sx={{ fontSize: 16, color: "text.secondary" }}
                />
                <Typography variant="body2" color="text.secondary">
                  {company.address}
                </Typography>
              </Box>
            )}

            {company.employee_count != null && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PeopleOutlined
                  sx={{ fontSize: 16, color: "text.secondary" }}
                />
                <Typography variant="body2" color="text.secondary">
                  {company.employee_count}名
                </Typography>
              </Box>
            )}

            {company.average_rating != null && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Rating
                  value={company.average_rating}
                  readOnly
                  size="small"
                  precision={0.5}
                />
                <Typography variant="body2" color="text.secondary">
                  {company.average_rating.toFixed(1)}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
