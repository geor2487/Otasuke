"use client";

import NextLink from "next/link";
import { Box, Container, Grid, Link, Typography } from "@mui/material";

export default function PublicFooter() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#212121",
        color: "#FFFFFF",
        py: 6,
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Service overview */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              variant="h6"
              sx={{ color: "#F26522", fontWeight: 700, mb: 2 }}
            >
              おたすけくん
            </Typography>
            <Typography variant="body2" sx={{ color: "grey.400" }}>
              元請け業者と下請け業者をつなぐ
              建設業界特化のマッチングプラットフォーム
            </Typography>
          </Grid>

          {/* Links */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              サービス
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                component={NextLink}
                href="/browse"
                sx={{ color: "grey.400", textDecoration: "none", "&:hover": { color: "#F26522" } }}
              >
                案件を探す
              </Link>
              <Link
                component={NextLink}
                href="/register"
                sx={{ color: "grey.400", textDecoration: "none", "&:hover": { color: "#F26522" } }}
              >
                新規登録
              </Link>
              <Link
                component={NextLink}
                href="/login"
                sx={{ color: "grey.400", textDecoration: "none", "&:hover": { color: "#F26522" } }}
              >
                ログイン
              </Link>
            </Box>
          </Grid>

          {/* Support */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              サポート
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2" sx={{ color: "grey.400" }}>
                お問い合わせ: support@kensetsu-matching.jp
              </Typography>
              <Typography variant="body2" sx={{ color: "grey.400" }}>
                営業時間: 平日 9:00 - 18:00
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            borderTop: 1,
            borderColor: "grey.800",
            mt: 4,
            pt: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="body2" sx={{ color: "grey.500" }}>
            &copy; {new Date().getFullYear()} おたすけくん All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
