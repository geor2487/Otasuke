"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined";
import { useAuth } from "@/hooks/use-auth";
import {
  useProject,
  useProjectQuotes,
  useUpdateProjectStatus,
  useUploadProjectFile,
} from "@/hooks/use-projects";
import { useAcceptQuote, useRejectQuote, useSubmitQuote } from "@/hooks/use-quotes";
import { PageHeader, StatusBadge, ConfirmDialog } from "@/components/common";

// ---------------------------------------------------------------------------
// Status transition helpers
// ---------------------------------------------------------------------------

type StatusAction = {
  label: string;
  nextStatus: string;
  color: "primary" | "error" | "success" | "warning" | "info";
};

function getStatusActions(status: string, hasAcceptedQuote: boolean): StatusAction[] {
  const actions: StatusAction[] = [];

  if (status === "draft") {
    actions.push({ label: "募集開始", nextStatus: "open", color: "success" });
  }
  if (status === "open") {
    actions.push({ label: "募集締切", nextStatus: "closed", color: "warning" });
  }
  if ((status === "closed" || status === "open") && hasAcceptedQuote) {
    actions.push({ label: "進行中にする", nextStatus: "in_progress", color: "info" });
  }
  if (status === "in_progress") {
    actions.push({ label: "完了にする", nextStatus: "completed", color: "primary" });
  }
  if (status !== "completed" && status !== "cancelled") {
    actions.push({ label: "キャンセル", nextStatus: "cancelled", color: "error" });
  }

  return actions;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, company } = useAuth();

  const { data: project, isLoading, error } = useProject(id);
  const { data: quotesData } = useProjectQuotes(id);
  const updateStatus = useUpdateProjectStatus(id);
  const uploadFile = useUploadProjectFile(id);
  const acceptQuote = useAcceptQuote();
  const rejectQuote = useRejectQuote();
  const submitQuote = useSubmitQuote(id);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmColor, setConfirmColor] = useState<"primary" | "error">("primary");
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState<string | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quote form state
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteEstimatedDays, setQuoteEstimatedDays] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");

  const isOwner = company != null && project != null && company.id === project.company_id;
  const isSubcontractor = user?.role === "subcontractor";
  const quotes = quotesData?.items ?? [];
  const hasAcceptedQuote = quotes.some((q) => q.status === "accepted");

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function openConfirm(
    title: string,
    message: string,
    color: "primary" | "error",
    action: () => Promise<void>,
  ) {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmColor(color);
    setPendingAction(() => action);
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    if (!pendingAction) return;
    setActionLoading(true);
    try {
      await pendingAction();
      setConfirmOpen(false);
    } catch {
      // keep dialog open on error
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStatusChange(nextStatus: string) {
    await updateStatus.mutateAsync({ status: nextStatus });
    setSnackbar("ステータスを更新しました");
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    await uploadFile.mutateAsync(formData);
    setSnackbar("ファイルをアップロードしました");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleAcceptQuote(quoteId: string) {
    await acceptQuote.mutateAsync(quoteId);
    setSnackbar("見積もりを採用しました");
  }

  async function handleRejectQuote(quoteId: string) {
    await rejectQuote.mutateAsync(quoteId);
    setSnackbar("見積もりを不採用にしました");
  }

  async function handleSubmitQuote() {
    await submitQuote.mutateAsync({
      amount: Number(quoteAmount),
      estimated_days: quoteEstimatedDays ? Number(quoteEstimatedDays) : null,
      message: quoteMessage || null,
    });
    setQuoteAmount("");
    setQuoteEstimatedDays("");
    setQuoteMessage("");
    setSnackbar("見積もりを送信しました");
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Alert severity="error">
        案件情報の取得に失敗しました。再度お試しください。
      </Alert>
    );
  }

  const statusActions = isOwner
    ? getStatusActions(project.status, hasAcceptedQuote)
    : [];

  return (
    <>
      <PageHeader
        title={project.title}
        action={
          isOwner && statusActions.length > 0 ? (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {statusActions.map((action) => (
                <Button
                  key={action.nextStatus}
                  variant={action.color === "error" ? "outlined" : "contained"}
                  color={action.color}
                  size="small"
                  onClick={() =>
                    openConfirm(
                      "ステータス変更",
                      `ステータスを「${action.label}」に変更しますか？`,
                      action.color === "error" ? "error" : "primary",
                      () => handleStatusChange(action.nextStatus),
                    )
                  }
                >
                  {action.label}
                </Button>
              ))}
            </Box>
          ) : undefined
        }
      />

      {/* ------------------------------------------------------------------ */}
      {/* Project info card                                                    */}
      {/* ------------------------------------------------------------------ */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography variant="h6">案件情報</Typography>
            <StatusBadge status={project.status} />
          </Box>

          {project.description && (
            <Typography variant="body1" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
              {project.description}
            </Typography>
          )}

          <Grid container spacing={2}>
            {project.location && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="textSecondary">
                  場所
                </Typography>
                <Typography variant="body2">{project.location}</Typography>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="textSecondary">
                予算
              </Typography>
              <Typography variant="body2">
                {project.budget_min != null || project.budget_max != null
                  ? `¥${project.budget_min?.toLocaleString() ?? "---"} - ¥${project.budget_max?.toLocaleString() ?? "---"}`
                  : "予算未定"}
              </Typography>
            </Grid>

            {project.deadline && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="textSecondary">
                  期限
                </Typography>
                <Typography variant="body2">
                  {new Date(project.deadline).toLocaleDateString("ja-JP")}
                </Typography>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="textSecondary">
                作成日
              </Typography>
              <Typography variant="body2">
                {new Date(project.created_at).toLocaleDateString("ja-JP")}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* File upload section (owner only)                                     */}
      {/* ------------------------------------------------------------------ */}
      {isOwner && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              添付ファイル
            </Typography>

            {project.files.length > 0 ? (
              <List dense>
                {project.files.map((file) => (
                  <ListItem
                    key={file.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        component="a"
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <DownloadOutlined />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={file.file_name}
                      secondary={
                        file.file_size != null
                          ? `${(file.file_size / 1024).toFixed(1)} KB`
                          : undefined
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                添付ファイルはありません
              </Typography>
            )}

            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={handleFileUpload}
            />
            <Button
              variant="outlined"
              startIcon={
                uploadFile.isPending ? (
                  <CircularProgress size={20} />
                ) : (
                  <UploadFileOutlined />
                )
              }
              disabled={uploadFile.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              ファイルを追加
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Quotes section (owner only)                                          */}
      {/* ------------------------------------------------------------------ */}
      {isOwner && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 2 }}>
              見積もり一覧
            </Typography>

            {quotes.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                まだ見積もりはありません
              </Typography>
            ) : (
              quotes.map((quote) => (
                <Card key={quote.id} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        企業ID: {quote.company_id}
                      </Typography>
                      <StatusBadge status={quote.status} type="quote" />
                    </Box>

                    <Typography variant="h6">
                      ¥{quote.amount.toLocaleString()}
                    </Typography>

                    {quote.estimated_days != null && (
                      <Typography variant="body2">
                        工期: {quote.estimated_days}日
                      </Typography>
                    )}

                    {quote.message && (
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mt: 1, whiteSpace: "pre-wrap" }}
                      >
                        {quote.message}
                      </Typography>
                    )}

                    {quote.status === "submitted" && (
                      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() =>
                            openConfirm(
                              "見積もり採用",
                              "この見積もりを採用しますか？",
                              "primary",
                              () => handleAcceptQuote(quote.id),
                            )
                          }
                        >
                          採用
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() =>
                            openConfirm(
                              "見積もり不採用",
                              "この見積もりを不採用にしますか？",
                              "error",
                              () => handleRejectQuote(quote.id),
                            )
                          }
                        >
                          不採用
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Submit quote section (subcontractor, not owner, project is open)     */}
      {/* ------------------------------------------------------------------ */}
      {!isOwner && isSubcontractor && project.status === "open" && (
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
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="工期 (日)"
                  type="number"
                  fullWidth
                  value={quoteEstimatedDays}
                  onChange={(e) => setQuoteEstimatedDays(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="メッセージ"
                  fullWidth
                  multiline
                  rows={3}
                  value={quoteMessage}
                  onChange={(e) => setQuoteMessage(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    disabled={!quoteAmount || submitQuote.isPending}
                    startIcon={
                      submitQuote.isPending ? (
                        <CircularProgress size={20} />
                      ) : undefined
                    }
                    onClick={handleSubmitQuote}
                  >
                    見積もりを送信
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Confirm dialog                                                       */}
      {/* ------------------------------------------------------------------ */}
      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        confirmColor={confirmColor}
        loading={actionLoading}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Snackbar                                                             */}
      {/* ------------------------------------------------------------------ */}
      <Snackbar
        open={snackbar !== null}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
      />
    </>
  );
}
