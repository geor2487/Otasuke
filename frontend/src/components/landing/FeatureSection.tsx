"use client";

import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import {
  SearchOutlined,
  HandshakeOutlined,
  VerifiedUserOutlined,
} from "@mui/icons-material";

const features = [
  {
    icon: <SearchOutlined sx={{ fontSize: 48 }} />,
    title: "かんたん検索",
    description:
      "専門分野やエリアで案件を絞り込み。登録不要で案件を閲覧できるので、まずは気軽にチェック。",
  },
  {
    icon: <HandshakeOutlined sx={{ fontSize: 48 }} />,
    title: "スムーズなマッチング",
    description:
      "見積もり提出から発注まで、すべてプラットフォーム上で完結。やり取りの手間を最小限に。",
  },
  {
    icon: <VerifiedUserOutlined sx={{ fontSize: 48 }} />,
    title: "安心の取引",
    description:
      "レビュー・評価システムで信頼できるパートナーを見つけやすい。企業情報も事前に確認可能。",
  },
];

export default function FeatureSection() {
  return (
    <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: "background.default" }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          align="center"
          sx={{ fontWeight: 700, mb: 6 }}
        >
          サービスの特徴
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid key={feature.title} size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  height: "100%",
                  textAlign: "center",
                  px: 2,
                  py: 3,
                }}
              >
                <CardContent>
                  <Box sx={{ color: "primary.main", mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
