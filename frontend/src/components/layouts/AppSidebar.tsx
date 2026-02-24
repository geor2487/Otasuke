"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  FolderOutlined,
  AddCircleOutline,
  BusinessOutlined,
  NotificationsOutlined,
  SearchOutlined,
  DescriptionOutlined,
  LogoutOutlined,
  SendOutlined,
  PeopleOutlined,
} from "@mui/icons-material";
import { useAuth } from "@/hooks/use-auth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const contractorNavItems: NavItem[] = [
  { label: "案件管理", href: "/projects", icon: <FolderOutlined /> },
  { label: "新規案件作成", href: "/projects/new", icon: <AddCircleOutline /> },
  { label: "業者を探す", href: "/subcontractors", icon: <PeopleOutlined /> },
  { label: "直接発注", href: "/direct-orders", icon: <SendOutlined /> },
  { label: "企業情報", href: "/companies/me", icon: <BusinessOutlined /> },
  {
    label: "お知らせ",
    href: "/notifications",
    icon: <NotificationsOutlined />,
  },
];

const subcontractorNavItems: NavItem[] = [
  { label: "案件を探す", href: "/browse", icon: <SearchOutlined /> },
  {
    label: "見積もり一覧",
    href: "/quotes",
    icon: <DescriptionOutlined />,
  },
  { label: "直接受注", href: "/direct-orders", icon: <SendOutlined /> },
  { label: "企業情報", href: "/companies/me", icon: <BusinessOutlined /> },
  {
    label: "お知らせ",
    href: "/notifications",
    icon: <NotificationsOutlined />,
  },
];

interface AppSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export const SIDEBAR_WIDTH = 260;
export const MINI_WIDTH = 72;

export default function AppSidebar({ mobileOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const { user, logout } = useAuth();

  const navItems =
    user?.role === "contractor" ? contractorNavItems : subcontractorNavItems;

  const sidebarContent = (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ px: 3, py: 2 }}>
        <Typography
          variant="h5"
          fontWeight={700}
          color="primary"
          noWrap
          className="sidebar-brand"
        >
          おたすけくん
        </Typography>
      </Box>

      <Divider />

      <List component="nav" sx={{ flex: 1, px: 1, py: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.href}
            component={NextLink}
            href={item.href}
            selected={pathname === item.href}
            onClick={!isMdUp ? onClose : undefined}
            sx={{ borderRadius: 1, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      <Box sx={{ px: 1, py: 1 }}>
        <ListItemButton onClick={logout} sx={{ borderRadius: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutOutlined />
          </ListItemIcon>
          <ListItemText primary="ログアウト" />
        </ListItemButton>
      </Box>
    </Box>
  );

  if (isMdUp) {
    return (
      <Box
        component="nav"
        sx={{
          width: MINI_WIDTH,
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          backgroundColor: "background.paper",
          borderRight: 1,
          borderColor: "divider",
          overflowX: "hidden",
          zIndex: theme.zIndex.drawer,
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          "& .MuiListItemText-root": {
            opacity: 0,
            transition: "opacity 0.15s",
          },
          "& .sidebar-brand": {
            opacity: 0,
            transition: "opacity 0.15s",
          },
          "&:hover": {
            width: SIDEBAR_WIDTH,
            boxShadow: 6,
            "& .MuiListItemText-root": {
              opacity: 1,
            },
            "& .sidebar-brand": {
              opacity: 1,
            },
          },
        }}
      >
        {sidebarContent}
      </Box>
    );
  }

  return (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        "& .MuiDrawer-paper": {
          width: SIDEBAR_WIDTH,
          boxSizing: "border-box",
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
}
