"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  Grid,
  Link,
} from "@mui/material";
import {
  BusinessOutlined,
  EngineeringOutlined,
} from "@mui/icons-material";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/types";

const registerSchema = z
  .object({
    email: z.string().email("有効なメールアドレスを入力してください"),
    password: z.string().min(8, "パスワードは8文字以上で入力してください"),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "パスワードが一致しません",
    path: ["passwordConfirm"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    if (!role) return;
    setError(null);
    try {
      await registerUser(data.email, data.password, role);
      router.push(role === "subcontractor" ? "/browse" : "/companies/me");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "登録に失敗しました"
      );
    }
  };

  const roleCards: {
    value: UserRole;
    icon: React.ReactNode;
    label: string;
    description: string;
  }[] = [
    {
      value: "contractor",
      icon: <BusinessOutlined sx={{ fontSize: 40 }} />,
      label: "元請け業者",
      description: "案件を作成し、下請け業者に発注する",
    },
    {
      value: "subcontractor",
      icon: <EngineeringOutlined sx={{ fontSize: 40 }} />,
      label: "下請け業者",
      description: "案件を探し、見積もりを提出する",
    },
  ];

  return (
    <Card sx={{ p: 4 }}>
      <Typography variant="h4" align="center">
        新規登録
      </Typography>
      <Typography
        variant="body2"
        color="textSecondary"
        align="center"
        sx={{ mb: 3 }}
      >
        おたすけくん
      </Typography>

      {!role ? (
        <Grid container spacing={2}>
          {roleCards.map((item) => (
            <Grid size={{ xs: 6 }} key={item.value}>
              <Card
                variant="outlined"
                sx={{
                  p: 2,
                  cursor: "pointer",
                  textAlign: "center",
                  border: "1px solid",
                  borderColor:
                    role === item.value ? "primary.main" : "divider",
                  backgroundColor:
                    role === item.value
                      ? "rgba(21, 101, 192, 0.04)"
                      : "transparent",
                  "&:hover": {
                    borderColor: "primary.main",
                  },
                }}
                onClick={() => setRole(item.value)}
              >
                <Box sx={{ color: "primary.main", mb: 1 }}>
                  {item.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {item.label}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {item.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            label="メールアドレス"
            type="email"
            fullWidth
            margin="normal"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            label="パスワード"
            type="password"
            fullWidth
            margin="normal"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <TextField
            label="パスワード(確認)"
            type="password"
            fullWidth
            margin="normal"
            {...register("passwordConfirm")}
            error={!!errors.passwordConfirm}
            helperText={errors.passwordConfirm?.message}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting}
            sx={{ mt: 3, mb: 1 }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : "登録する"}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={() => setRole(null)}
            sx={{ mb: 2 }}
          >
            ロールを選択し直す
          </Button>

          <Typography variant="body2" align="center">
            既にアカウントをお持ちの方は{" "}
            <Link component={NextLink} href="/login">
              ログイン
            </Link>
          </Typography>
        </Box>
      )}
    </Card>
  );
}
