"use client";

import { useState } from "react";
import NextLink from "next/link";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  SearchOutlined,
  LockOutlined,
  EditOutlined,
  CloseOutlined,
  ExpandMoreOutlined,
} from "@mui/icons-material";
import { useSpecialties } from "@/hooks/use-companies";
import { useAuth } from "@/hooks/use-auth";

type SearchFilterBarProps = {
  location: string;
  onLocationChange: (value: string) => void;
  specialtyId: string;
  onSpecialtyChange: (value: string) => void;
  onSearch: () => void;
};

// 全47都道府県 (地方別)
const AREA_GROUPS: { region: string; prefectures: string[] }[] = [
  { region: "北海道・東北", prefectures: ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"] },
  { region: "関東", prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"] },
  { region: "中部", prefectures: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"] },
  { region: "近畿", prefectures: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"] },
  { region: "中国", prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"] },
  { region: "四国", prefectures: ["徳島県", "香川県", "愛媛県", "高知県"] },
  { region: "九州・沖縄", prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"] },
];

export default function SearchFilterBar({
  location,
  onLocationChange,
  specialtyId,
  onSpecialtyChange,
  onSearch,
}: SearchFilterBarProps) {
  const { data: specialties } = useSpecialties();
  const { isAuthenticated, isLoading } = useAuth();
  const [specialtyDialogOpen, setSpecialtyDialogOpen] = useState(false);
  const [areaDialogOpen, setAreaDialogOpen] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState(true);
  const [ctaExpanded, setCtaExpanded] = useState(true);

  const selectedSpecialtyName =
    specialties?.find((s) => s.id === specialtyId)?.name ?? "";

  return (
    <Box>
      {/* Header banner */}
      <Box
        sx={{
          border: 2,
          borderColor: "primary.main",
          borderRadius: 2,
          py: 1.5,
          px: 2,
          mb: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          専門分野・エリアで案件を検索できます
        </Typography>
      </Box>

      {/* Main filter card - Accordion */}
      <Accordion
        expanded={filterExpanded}
        onChange={() => setFilterExpanded((prev) => !prev)}
        disableGutters
        sx={{
          mb: 2,
          borderRadius: 2,
          "&:before": { display: "none" },
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.08)",
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreOutlined />}
          sx={{ fontWeight: 700 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            検索条件
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Divider />

          {/* Specialty filter row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 3,
              py: 2.5,
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                専門分野
              </Typography>
              {selectedSpecialtyName && (
                <Chip
                  label={selectedSpecialtyName}
                  size="small"
                  onDelete={() => onSpecialtyChange("")}
                  sx={{ mt: 0.5 }}
                />
              )}
            </Box>
            <Button
              variant="outlined"
              size="small"
              sx={{
                borderRadius: 5,
                borderColor: "grey.400",
                color: "text.primary",
                minWidth: 100,
              }}
              onClick={() => setSpecialtyDialogOpen(true)}
            >
              選択する
            </Button>
          </Box>

          <Divider />

          {/* Area filter row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 3,
              py: 2.5,
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                対応エリア
              </Typography>
              {location && (
                <Chip
                  label={location}
                  size="small"
                  onDelete={() => onLocationChange("")}
                  sx={{ mt: 0.5 }}
                />
              )}
            </Box>
            <Button
              variant="outlined"
              size="small"
              sx={{
                borderRadius: 5,
                borderColor: "grey.400",
                color: "text.primary",
                minWidth: 100,
              }}
              onClick={() => setAreaDialogOpen(true)}
            >
              選択する
            </Button>
          </Box>

          <Divider />

          {/* Search button */}
          <Box sx={{ px: 3, py: 3 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              startIcon={<SearchOutlined />}
              onClick={onSearch}
              sx={{
                fontWeight: 700,
                fontSize: "1rem",
                py: 1.5,
                borderRadius: 6,
              }}
            >
              この条件で検索!
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Registration CTA for unauthenticated users - Accordion */}
      {!isLoading && !isAuthenticated && (
        <Accordion
          expanded={ctaExpanded}
          onChange={() => setCtaExpanded((prev) => !prev)}
          disableGutters
          sx={{
            borderRadius: 2,
            "&:before": { display: "none" },
            boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.08)",
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              さらに詳しく検索
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{
                backgroundColor: "grey.100",
                borderRadius: 1,
                py: 1.5,
                px: 2,
                mb: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                新規登録で、さらに条件設定が可能に!
              </Typography>
            </Box>

            {["予算レンジ", "工期", "企業評価", "施工実績"].map((label) => (
              <Box
                key={label}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  py: 1,
                  px: 1,
                }}
              >
                <LockOutlined sx={{ fontSize: 18, color: "grey.400" }} />
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
              </Box>
            ))}

            <Typography
              variant="caption"
              color="text.secondary"
              align="center"
              sx={{ display: "block", mt: 2, mb: 1 }}
            >
              ＼ 簡単1分で完了 ／
            </Typography>

            <Button
              component={NextLink}
              href="/register"
              variant="outlined"
              color="secondary"
              fullWidth
              startIcon={<EditOutlined />}
              sx={{
                fontWeight: 700,
                borderRadius: 6,
                py: 1.2,
              }}
            >
              【無料】会員登録する
            </Button>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Specialty selection dialog */}
      <Dialog
        open={specialtyDialogOpen}
        onClose={() => setSpecialtyDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          専門分野を選択
          <IconButton onClick={() => setSpecialtyDialogOpen(false)} size="small">
            <CloseOutlined />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List>
            <ListItemButton
              selected={specialtyId === ""}
              onClick={() => {
                onSpecialtyChange("");
                setSpecialtyDialogOpen(false);
              }}
            >
              <ListItemText primary="全て" />
            </ListItemButton>
            {specialties?.map((s) => (
              <ListItemButton
                key={s.id}
                selected={specialtyId === s.id}
                onClick={() => {
                  onSpecialtyChange(s.id);
                  setSpecialtyDialogOpen(false);
                }}
              >
                <ListItemText primary={s.name} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Area selection dialog - grouped by region with accordions */}
      <Dialog
        open={areaDialogOpen}
        onClose={() => setAreaDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          エリアを選択
          <IconButton onClick={() => setAreaDialogOpen(false)} size="small">
            <CloseOutlined />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List disablePadding>
            <ListItemButton
              selected={location === ""}
              onClick={() => {
                onLocationChange("");
                setAreaDialogOpen(false);
              }}
            >
              <ListItemText
                primary="全て"
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>
          </List>
          {AREA_GROUPS.map((group) => (
            <Accordion key={group.region} disableGutters sx={{ "&:before": { display: "none" } }}>
              <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {group.region}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List dense disablePadding>
                  {group.prefectures.map((pref) => (
                    <ListItemButton
                      key={pref}
                      selected={location === pref}
                      sx={{ pl: 4 }}
                      onClick={() => {
                        onLocationChange(pref);
                        setAreaDialogOpen(false);
                      }}
                    >
                      <ListItemText primary={pref} />
                    </ListItemButton>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
