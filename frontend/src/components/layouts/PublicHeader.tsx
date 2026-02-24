"use client";

import { useState } from "react";
import NextLink from "next/link";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  MenuOutlined,
  CloseOutlined,
  AccountCircleOutlined,
  EditOutlined,
} from "@mui/icons-material";
import { useAuth } from "@/hooks/use-auth";

export default function PublicHeader() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const { isAuthenticated, isLoading } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navLinks = [{ label: "案件を探す", href: "/browse" }];

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: "#F5F5F5",
          color: "#212121",
        }}
      >
        <Toolbar sx={{ maxWidth: "lg", width: "100%", mx: "auto", pr: { md: 0 } }}>
          {/* Logo */}
          <Typography
            variant="h6"
            component={NextLink}
            href="/"
            sx={{
              color: "#F26522",
              fontWeight: 700,
              textDecoration: "none",
              mr: 4,
            }}
          >
            おたすけくん
          </Typography>

          {isMdUp ? (
            <>
              {/* Desktop nav links */}
              <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
                {navLinks.map((link) => (
                  <Button
                    key={link.href}
                    component={NextLink}
                    href={link.href}
                    sx={{ color: "#212121", fontWeight: 500 }}
                  >
                    {link.label}
                  </Button>
                ))}
              </Box>

              {/* Auth buttons (only for unauthenticated users) */}
              {!isLoading && !isAuthenticated && (
                <Box sx={{ display: "flex", alignSelf: "stretch" }}>
                  <Box
                    component={NextLink}
                    href="/login"
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      px: 3,
                      backgroundColor: "#E0E0E0",
                      color: "#212121",
                      textDecoration: "none",
                      transition: "background-color 0.2s",
                      "&:hover": { backgroundColor: "#D0D0D0" },
                    }}
                  >
                    <AccountCircleOutlined sx={{ fontSize: 24, mb: 0.25 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "0.7rem" }}>
                      ログイン
                    </Typography>
                  </Box>
                  <Box
                    component={NextLink}
                    href="/register"
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      px: 3,
                      backgroundColor: "#F26522",
                      color: "#212121",
                      textDecoration: "none",
                      transition: "background-color 0.2s",
                      "&:hover": { backgroundColor: "#e0aa00" },
                    }}
                  >
                    <EditOutlined sx={{ fontSize: 24, mb: 0.25 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "0.7rem" }}>
                      新規登録
                    </Typography>
                  </Box>
                </Box>
              )}
            </>
          ) : (
            <>
              <Box sx={{ flex: 1 }} />
              <IconButton
                color="inherit"
                onClick={() => setDrawerOpen(true)}
                aria-label="メニュー"
              >
                <MenuOutlined />
              </IconButton>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ "& .MuiDrawer-paper": { width: 280, backgroundColor: "#212121" } }}
      >
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{ color: "#FFFFFF" }}
          >
            <CloseOutlined />
          </IconButton>
        </Box>
        <List>
          {navLinks.map((link) => (
            <ListItemButton
              key={link.href}
              component={NextLink}
              href={link.href}
              onClick={() => setDrawerOpen(false)}
            >
              <ListItemText
                primary={link.label}
                sx={{ color: "#FFFFFF" }}
              />
            </ListItemButton>
          ))}
        </List>
        {!isLoading && !isAuthenticated && (
          <Box sx={{ px: 2, mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
            <Button
              component={NextLink}
              href="/login"
              variant="outlined"
              fullWidth
              sx={{ color: "#FFFFFF", borderColor: "#FFFFFF" }}
              onClick={() => setDrawerOpen(false)}
            >
              ログイン
            </Button>
            <Button
              component={NextLink}
              href="/register"
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => setDrawerOpen(false)}
            >
              新規登録
            </Button>
          </Box>
        )}
      </Drawer>
    </>
  );
}
