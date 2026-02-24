"use client";

import { useState } from "react";
import NextLink from "next/link";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "@/hooks/use-auth";
import { useSubmitQuote } from "@/hooks/use-quotes";

type QuoteCTAProps = {
  projectId: string;
  projectStatus: string;
};

export default function QuoteCTA({ projectId, projectStatus }: QuoteCTAProps) {
  const { user, company, isAuthenticated, isLoading } = useAuth();
  const submitQuote = useSubmitQuote(projectId);

  const [amount, setAmount] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (isLoading || projectStatus !== "open") return null;

  // Contractor → hide CTA
  if (isAuthenticated && user?.role === "contractor") return null;

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            この案件に見積もりを提出しませんか?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            無料の会員登録で、案件への見積もり提出が可能になります
          </Typography>
          <Button
            component={NextLink}
            href="/register"
            variant="contained"
            color="primary"
            size="large"
            sx={{ fontWeight: 700 }}
          >
            無料会員登録して見積もりする
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Authenticated but no company
  if (!company) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            見積もりを提出するには企業情報の登録が必要です
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            企業情報を登録すると、案件への見積もり提出が可能になります
          </Typography>
          <Button
            component={NextLink}
            href="/companies/me"
            variant="contained"
            color="primary"
            size="large"
            sx={{ fontWeight: 700 }}
          >
            企業情報を登録して見積もりする
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Authenticated + company + subcontractor → quote form
  const handleSubmit = async () => {
    await submitQuote.mutateAsync({
      amount: Number(amount),
      estimated_days: estimatedDays ? Number(estimatedDays) : null,
      message: message || null,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <CheckCircleOutlineIcon
            color="success"
            sx={{ fontSize: 48, mb: 1 }}
          />
          <Typography variant="h6" sx={{ mb: 1 }}>
            見積もりを送信しました
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            送信した見積もりは一覧ページから確認できます
          </Typography>
          <Button
            component={NextLink}
            href="/quotes"
            variant="contained"
            size="large"
          >
            見積もりを確認
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          見積もりを送信
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="金額 (円)"
              type="number"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="工期 (日)"
              type="number"
              fullWidth
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="メッセージ"
              fullWidth
              multiline
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                disabled={!amount || submitQuote.isPending}
                startIcon={
                  submitQuote.isPending ? (
                    <CircularProgress size={20} />
                  ) : undefined
                }
                onClick={handleSubmit}
              >
                見積もりを送信
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
