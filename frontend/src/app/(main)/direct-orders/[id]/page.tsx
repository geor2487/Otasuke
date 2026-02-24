"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { PageHeader, StatusBadge } from "@/components/common";
import {
  useDirectOrder,
  useAcceptDirectOrder,
  useDeclineDirectOrder,
  useStartDirectOrder,
  useCompleteDirectOrder,
  useCancelDirectOrder,
} from "@/hooks/use-direct-orders";
import { useAuth } from "@/hooks/use-auth";

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <Box sx={{ display: "flex", gap: 2, mb: 1.5 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: 120, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}

export default function DirectOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, company } = useAuth();

  const { data: order, isLoading, error } = useDirectOrder(id);
  const acceptMutation = useAcceptDirectOrder();
  const declineMutation = useDeclineDirectOrder();
  const startMutation = useStartDirectOrder();
  const completeMutation = useCompleteDirectOrder();
  const cancelMutation = useCancelDirectOrder();

  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <>
        <PageHeader title="直接発注詳細" />
        <Alert severity="error">発注情報の取得に失敗しました</Alert>
      </>
    );
  }

  const isContractor =
    user?.role === "contractor" &&
    company?.id === order.contractor_company_id;
  const isSubcontractor =
    user?.role === "subcontractor" &&
    company?.id === order.subcontractor_company_id;

  const handleAccept = async () => {
    await acceptMutation.mutateAsync(id);
  };

  const handleDecline = async () => {
    await declineMutation.mutateAsync({
      id,
      body: { decline_reason: declineReason || null },
    });
    setDeclineDialogOpen(false);
  };

  const handleStart = async () => {
    await startMutation.mutateAsync(id);
  };

  const handleComplete = async () => {
    await completeMutation.mutateAsync(id);
  };

  const handleCancel = async () => {
    await cancelMutation.mutateAsync(id);
    setCancelDialogOpen(false);
  };

  return (
    <>
      <PageHeader title="直接発注詳細" />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Typography variant="h5" fontWeight={700}>
              {order.title}
            </Typography>
            <StatusBadge status={order.status} type="direct_order" />
          </Box>

          <Divider sx={{ my: 2 }} />

          <InfoRow label="発注元" value={order.contractor_company_name} />
          <InfoRow label="発注先" value={order.subcontractor_company_name} />
          <InfoRow
            label="発注金額"
            value={`${order.amount.toLocaleString()}円`}
          />
          <InfoRow
            label="希望納期"
            value={
              order.deadline
                ? new Date(order.deadline).toLocaleDateString("ja-JP")
                : null
            }
          />
          <InfoRow label="施工場所" value={order.location} />
          <InfoRow
            label="専門分野"
            value={
              order.specialty_name ? (
                <Chip label={order.specialty_name} size="small" />
              ) : null
            }
          />
          <InfoRow
            label="作成日"
            value={new Date(order.created_at).toLocaleDateString("ja-JP")}
          />

          {order.description && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                作業内容
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {order.description}
              </Typography>
            </>
          )}

          {order.decline_reason && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="error" gutterBottom>
                辞退理由
              </Typography>
              <Typography variant="body2">{order.decline_reason}</Typography>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action buttons */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {/* Subcontractor: pending → accept/decline */}
        {isSubcontractor && order.status === "pending" && (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAccept}
              disabled={acceptMutation.isPending}
            >
              {acceptMutation.isPending ? (
                <CircularProgress size={20} />
              ) : (
                "承諾する"
              )}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setDeclineDialogOpen(true)}
            >
              辞退する
            </Button>
          </>
        )}

        {/* Either: accepted → start */}
        {(isContractor || isSubcontractor) && order.status === "accepted" && (
          <Button
            variant="contained"
            onClick={handleStart}
            disabled={startMutation.isPending}
          >
            {startMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              "作業開始"
            )}
          </Button>
        )}

        {/* Either: in_progress → complete */}
        {(isContractor || isSubcontractor) &&
          order.status === "in_progress" && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleComplete}
              disabled={completeMutation.isPending}
            >
              {completeMutation.isPending ? (
                <CircularProgress size={20} />
              ) : (
                "完了にする"
              )}
            </Button>
          )}

        {/* Contractor: pending/accepted → cancel */}
        {isContractor &&
          (order.status === "pending" || order.status === "accepted") && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => setCancelDialogOpen(true)}
            >
              キャンセル
            </Button>
          )}
      </Box>

      {/* Decline dialog */}
      <Dialog
        open={declineDialogOpen}
        onClose={() => setDeclineDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>発注を辞退する</DialogTitle>
        <DialogContent>
          <TextField
            label="辞退理由 (任意)"
            fullWidth
            multiline
            rows={3}
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeclineDialogOpen(false)}>戻る</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDecline}
            disabled={declineMutation.isPending}
          >
            辞退する
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>発注をキャンセルしますか?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            この操作は取り消せません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>戻る</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
          >
            キャンセルする
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
