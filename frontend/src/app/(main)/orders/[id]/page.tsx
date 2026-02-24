"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import Rating from "@mui/material/Rating";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAuth } from "@/hooks/use-auth";
import { useOrder, useCompleteOrder, useCreateReview } from "@/hooks/use-orders";
import { PageHeader, StatusBadge, ConfirmDialog } from "@/components/common";

// ---------------------------------------------------------------------------
// Review form schema
// ---------------------------------------------------------------------------

const reviewSchema = z.object({
  rating: z.number().min(1, "評価を入力してください").max(5),
  comment: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: order, isLoading, error } = useOrder(id);

  const completeOrder = useCompleteOrder();
  const createReview = useCreateReview(id);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  // Loading
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error
  if (error || !order) {
    return (
      <>
        <PageHeader title="発注詳細" />
        <Alert severity="error">
          データの取得に失敗しました。再度お試しください。
        </Alert>
      </>
    );
  }

  const handleComplete = async () => {
    await completeOrder.mutateAsync(id);
    setConfirmOpen(false);
  };

  const onSubmitReview = async (values: ReviewFormValues) => {
    await createReview.mutateAsync({
      rating: values.rating,
      comment: values.comment || null,
    });
    setSnackbarOpen(true);
  };

  const canComplete =
    order.status === "confirmed" || order.status === "in_progress";

  return (
    <>
      <PageHeader title="発注詳細" />

      {/* Order info card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <StatusBadge status={order.status} type="order" />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography variant="body1">
              案件ID:{" "}
              <Typography
                component={Link}
                href={`/projects/${order.project_id}`}
                color="primary"
                sx={{ textDecoration: "none" }}
              >
                {order.project_id}
              </Typography>
            </Typography>

            <Typography variant="body1">
              発注金額: ¥{order.amount.toLocaleString()}
            </Typography>

            <Typography variant="body1">
              元請け企業ID:{" "}
              <Typography
                component={Link}
                href={`/companies/${order.contractor_company_id}`}
                color="primary"
                sx={{ textDecoration: "none" }}
              >
                {order.contractor_company_id}
              </Typography>
            </Typography>

            <Typography variant="body1">
              下請け企業ID:{" "}
              <Typography
                component={Link}
                href={`/companies/${order.subcontractor_company_id}`}
                color="primary"
                sx={{ textDecoration: "none" }}
              >
                {order.subcontractor_company_id}
              </Typography>
            </Typography>

            <Typography variant="body1">
              発注日:{" "}
              {new Date(order.created_at).toLocaleDateString("ja-JP")}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Action: Complete */}
      {canComplete && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            onClick={() => setConfirmOpen(true)}
            disabled={completeOrder.isPending}
          >
            完了にする
          </Button>

          <ConfirmDialog
            open={confirmOpen}
            title="発注完了"
            message="この発注を完了にしますか？"
            onConfirm={handleComplete}
            onCancel={() => setConfirmOpen(false)}
            loading={completeOrder.isPending}
          />
        </Box>
      )}

      {/* Action: Review */}
      {order.status === "completed" && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              レビューを送信
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmitReview)}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  評価
                </Typography>
                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => (
                    <Rating
                      value={field.value}
                      onChange={(_e, newValue) =>
                        field.onChange(newValue ?? 0)
                      }
                    />
                  )}
                />
                {errors.rating && (
                  <Typography variant="caption" color="error">
                    {errors.rating.message}
                  </Typography>
                )}
              </Box>

              <Controller
                name="comment"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="コメント"
                    multiline
                    rows={3}
                  />
                )}
              />

              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || createReview.isPending}
                sx={{ alignSelf: "flex-start" }}
              >
                レビューを送信
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message="レビューを送信しました"
      />
    </>
  );
}
