"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppBar,
  Badge,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
} from "@mui/material";
import {
  MenuOutlined,
  NotificationsOutlined,
  AccountCircleOutlined,
} from "@mui/icons-material";
import { useAuth } from "@/hooks/use-auth";
import { MINI_WIDTH } from "./AppSidebar";

interface AppHeaderProps {
  onMenuClick: () => void;
  unreadCount?: number;
}

export default function AppHeader({
  onMenuClick,
  unreadCount = 0,
}: AppHeaderProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCompanyInfo = () => {
    handleUserMenuClose();
    router.push("/companies/me");
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        ml: { md: `${MINI_WIDTH}px` },
        width: { md: `calc(100% - ${MINI_WIDTH}px)` },
        backgroundColor: "background.paper",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          aria-label="メニュー"
          onClick={onMenuClick}
          sx={{ display: { md: "none" }, mr: 1 }}
        >
          <MenuOutlined />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton
          aria-label="お知らせ"
          onClick={() => router.push("/notifications")}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsOutlined />
          </Badge>
        </IconButton>

        <IconButton
          aria-label="ユーザーメニュー"
          onClick={handleUserMenuOpen}
          sx={{ ml: 1 }}
        >
          <AccountCircleOutlined />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleUserMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={handleCompanyInfo}>企業情報</MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>ログアウト</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
