"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ja } from "date-fns/locale";
import { PageHeader } from "@/components/common";
import { useCompany, useSpecialties } from "@/hooks/use-companies";
import { useCreateDirectOrder } from "@/hooks/use-direct-orders";

const directOrderSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  description: z.string().optional(),
  location: z.string().optional(),
  amount: z.string().min(1, "発注金額を入力してください"),
  deadline: z.date().nullable().optional(),
  specialty_id: z.string().optional(),
});

type FormValues = z.infer<typeof directOrderSchema>;

function DirectOrderNewPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("company_id") || "";

  const { data: targetCompany, isLoading: companyLoading } =
    useCompany(companyId);
  const { data: specialties } = useSpecialties();
  const createMutation = useCreateDirectOrder();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(directOrderSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      amount: "",
      deadline: null,
      specialty_id: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    await createMutation.mutateAsync({
      title: data.title,
      description: data.description || null,
      location: data.location || null,
      amount: Number(data.amount),
      deadline: data.deadline
        ? data.deadline.toISOString().split("T")[0]
        : null,
      specialty_id: data.specialty_id || null,
      subcontractor_company_id: companyId,
    });
    router.push("/direct-orders");
  };

  if (!companyId) {
    return (
      <>
        <PageHeader title="直接発注" />
        <Alert severity="error">発注先企業が指定されていません</Alert>
      </>
    );
  }

  if (companyLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <PageHeader title="直接発注作成" />

      {targetCompany && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              発注先
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {targetCompany.name}
            </Typography>
            {targetCompany.address && (
              <Typography variant="body2" color="text.secondary">
                {targetCompany.address}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            <TextField
              label="タイトル"
              fullWidth
              required
              {...register("title")}
              error={!!errors.title}
              helperText={errors.title?.message}
            />

            <TextField
              label="作業内容"
              fullWidth
              multiline
              rows={4}
              {...register("description")}
            />

            <TextField
              label="施工場所"
              fullWidth
              {...register("location")}
            />

            <TextField
              label="発注金額 (円)"
              fullWidth
              required
              type="number"
              {...register("amount")}
              error={!!errors.amount}
              helperText={typeof errors.amount?.message === "string" ? errors.amount.message : undefined}
            />

            <Controller
              name="deadline"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="希望納期"
                  value={field.value}
                  onChange={field.onChange}
                  minDate={new Date()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              )}
            />

            {specialties && specialties.length > 0 && (
              <TextField
                select
                label="専門分野"
                fullWidth
                defaultValue=""
                {...register("specialty_id")}
              >
                <MenuItem value="">指定なし</MenuItem>
                {specialties.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {createMutation.isError && (
              <Alert severity="error">
                {(createMutation.error as any)?.response?.data?.detail ||
                  "発注の作成に失敗しました"}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting || createMutation.isPending}
              sx={{ mt: 1 }}
            >
              {createMutation.isPending ? (
                <CircularProgress size={24} />
              ) : (
                "発注する"
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}

export default function DirectOrderNewPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      }
    >
      <DirectOrderNewPageInner />
    </Suspense>
  );
}
