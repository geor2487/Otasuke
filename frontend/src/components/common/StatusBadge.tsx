"use client";

import { Chip } from "@mui/material";

const PROJECT_STATUS_MAP: Record<string, { label: string; color: "default" | "success" | "warning" | "info" | "primary" | "error" }> = {
  draft: { label: "下書き", color: "default" },
  open: { label: "募集中", color: "success" },
  closed: { label: "締切", color: "warning" },
  in_progress: { label: "進行中", color: "info" },
  completed: { label: "完了", color: "primary" },
  cancelled: { label: "キャンセル", color: "error" },
};

const QUOTE_STATUS_MAP: Record<string, { label: string; color: "default" | "success" | "warning" | "info" | "primary" | "error" }> = {
  submitted: { label: "提出済み", color: "info" },
  accepted: { label: "採用", color: "success" },
  rejected: { label: "不採用", color: "error" },
  withdrawn: { label: "取下げ", color: "default" },
};

const ORDER_STATUS_MAP: Record<string, { label: string; color: "default" | "success" | "warning" | "info" | "primary" | "error" }> = {
  confirmed: { label: "確定", color: "info" },
  in_progress: { label: "進行中", color: "warning" },
  completed: { label: "完了", color: "success" },
  cancelled: { label: "キャンセル", color: "error" },
};

const DIRECT_ORDER_STATUS_MAP: Record<string, { label: string; color: "default" | "success" | "warning" | "info" | "primary" | "error" }> = {
  pending: { label: "承認待ち", color: "warning" },
  accepted: { label: "承認済み", color: "info" },
  declined: { label: "辞退", color: "error" },
  in_progress: { label: "進行中", color: "warning" },
  completed: { label: "完了", color: "success" },
  cancelled: { label: "キャンセル", color: "error" },
};

type StatusBadgeProps = {
  status: string;
  type?: "project" | "quote" | "order" | "direct_order";
};

export default function StatusBadge({ status, type = "project" }: StatusBadgeProps) {
  const statusMap =
    type === "quote"
      ? QUOTE_STATUS_MAP
      : type === "order"
        ? ORDER_STATUS_MAP
        : type === "direct_order"
          ? DIRECT_ORDER_STATUS_MAP
          : PROJECT_STATUS_MAP;

  const entry = statusMap[status] ?? { label: status, color: "default" as const };

  return <Chip label={entry.label} color={entry.color} size="small" />;
}
