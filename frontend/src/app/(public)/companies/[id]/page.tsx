"use client";

import { useParams } from "next/navigation";
import NextLink from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Rating,
  Typography,
} from "@mui/material";
import SendOutlined from "@mui/icons-material/SendOutlined";
import { useCompany, useCompanyReviews } from "@/hooks/use-companies";
import { useAuth } from "@/hooks/use-auth";
import type { ReviewResponse } from "@/types";

function ReviewCard({ review }: { review: ReviewResponse }) {
  return (
    <Box sx={{ mb: 2, p: 2, border: 1, borderColor: "divider", borderRadius: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Rating value={review.rating} readOnly size="small" />
        <Typography variant="body2" color="text.secondary">
          {new Date(review.created_at).toLocaleDateString("ja-JP")}
        </Typography>
      </Box>
      {review.comment && (
        <Typography variant="body2">{review.comment}</Typography>
      )}
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}

export default function PublicCompanyDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();

  const {
    data: company,
    isLoading: companyLoading,
    error: companyError,
  } = useCompany(id);

  const { data: reviewsData, isLoading: reviewsLoading } =
    useCompanyReviews(id);

  const showDirectOrderButton = user?.role === "contractor";

  if (companyLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (companyError || !company) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">企業情報の取得に失敗しました</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {company.name}
        </Typography>
        {showDirectOrderButton && (
          <Button
            component={NextLink}
            href={`/direct-orders/new?company_id=${company.id}`}
            variant="contained"
            startIcon={<SendOutlined />}
          >
            直接発注する
          </Button>
        )}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          {company.description && (
            <Typography variant="body1" sx={{ mb: 2 }}>
              {company.description}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          <InfoRow label="住所" value={company.address} />
          <InfoRow label="電話番号" value={company.phone} />
          <InfoRow
            label="Webサイト"
            value={
              company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {company.website}
                </a>
              ) : null
            }
          />
          <InfoRow
            label="設立年"
            value={
              company.established_year
                ? `${company.established_year}年`
                : null
            }
          />
          <InfoRow
            label="従業員数"
            value={
              company.employee_count
                ? `${company.employee_count}名`
                : null
            }
          />

          {company.average_rating != null && (
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}
            >
              <Typography variant="body2" color="text.secondary">
                平均評価
              </Typography>
              <Rating
                value={company.average_rating}
                readOnly
                precision={0.5}
              />
              <Typography variant="body2">
                {company.average_rating.toFixed(1)}
              </Typography>
            </Box>
          )}

          {company.specialties && company.specialties.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                専門分野
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {company.specialties.map((s) => (
                  <Chip key={s.id} label={s.name} size="small" />
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Reviews */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        レビュー
      </Typography>

      {reviewsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : !reviewsData || reviewsData.items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          まだレビューはありません
        </Typography>
      ) : (
        <Box>
          {reviewsData.items.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </Box>
      )}
    </Container>
  );
}
