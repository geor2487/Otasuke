"use client";

import NextLink from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";

const roles = [
  {
    title: "元請け業者の方",
    features: [
      "案件を投稿して下請けを募集",
      "見積もりを比較して最適なパートナーを選定",
      "発注から完了まで一元管理",
    ],
    buttonLabel: "無料で登録する",
    href: "/register",
  },
  {
    title: "下請け業者の方",
    features: [
      "自分の専門分野に合った案件を検索",
      "見積もりを提出してアピール",
      "実績・レビューで信頼を構築",
    ],
    buttonLabel: "無料で登録する",
    href: "/register",
  },
];

export default function RoleCtaSection() {
  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          align="center"
          sx={{ fontWeight: 700, mb: 6 }}
        >
          あなたに合った使い方
        </Typography>

        <Grid container spacing={4}>
          {roles.map((role) => (
            <Grid key={role.title} size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flex: 1, p: 4 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                    {role.title}
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 3 }}>
                    {role.features.map((feature) => (
                      <Typography
                        key={feature}
                        component="li"
                        variant="body1"
                        sx={{ mb: 1 }}
                      >
                        {feature}
                      </Typography>
                    ))}
                  </Box>
                  <Button
                    component={NextLink}
                    href={role.href}
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    sx={{ fontWeight: 700 }}
                  >
                    {role.buttonLabel}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
