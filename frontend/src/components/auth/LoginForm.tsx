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
  Link,
} from "@mui/material";
import { useAuth } from "@/hooks/use-auth";

const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      const loggedInUser = await login(data.email, data.password);
      router.push(
        loggedInUser.role === "subcontractor" ? "/browse" : "/projects",
      );
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "ログインに失敗しました"
      );
    }
  };

  return (
    <Card sx={{ p: 4 }}>
      <Typography variant="h4" align="center">
        ログイン
      </Typography>
      <Typography
        variant="body2"
        color="textSecondary"
        align="center"
        sx={{ mb: 3 }}
      >
        おたすけくん
      </Typography>

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
          sx={{ mt: 3, mb: 2 }}
        >
          {isSubmitting ? <CircularProgress size={24} /> : "ログイン"}
        </Button>

        <Typography variant="body2" align="center">
          アカウントをお持ちでない方は{" "}
          <Link component={NextLink} href="/register">
            新規登録
          </Link>
        </Typography>
      </Box>
    </Card>
  );
}
