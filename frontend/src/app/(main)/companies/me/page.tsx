"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "@/hooks/use-auth";
import {
  useCreateCompany,
  useUpdateCompany,
  useUpdateSpecialties,
  useSpecialties,
} from "@/hooks/use-companies";
import PageHeader from "@/components/common/PageHeader";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const optionalNumber = z
  .union([z.coerce.number().positive(), z.literal("")])
  .optional()
  .transform((v) => (v === "" || v === undefined ? null : v));

const companySchema = z.object({
  name: z.string().min(1, "企業名は必須です"),
  description: z.string().optional().default(""),
  address: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  website: z.string().optional().default(""),
  established_year: optionalNumber,
  employee_count: optionalNumber,
});

type CompanyFormValues = z.input<typeof companySchema>;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CompanyMePage() {
  const router = useRouter();
  const { company, refreshCompany } = useAuth();
  const isEdit = !!company;

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1900 + 1 }, (_, i) => ({
      value: currentYear - i,
    }));
  }, []);

  const { data: specialties, isLoading: specialtiesLoading } =
    useSpecialties();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const updateSpecialties = useUpdateSpecialties();

  // Selected specialty IDs (local state)
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>(
    [],
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  // company state が実際に更新されてからナビゲーションする
  useEffect(() => {
    if (shouldNavigate && company) {
      router.push("/dashboard");
    }
  }, [shouldNavigate, company, router]);

  // Populate selected specialties from existing company
  useEffect(() => {
    if (company?.specialties) {
      setSelectedSpecialtyIds(company.specialties.map((s) => s.id));
    }
  }, [company]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name ?? "",
      description: company?.description ?? "",
      address: company?.address ?? "",
      phone: company?.phone ?? "",
      website: company?.website ?? "",
      established_year: company?.established_year ?? "",
      employee_count: company?.employee_count ?? "",
    },
  });

  // ---------------------------------------------------------------------------
  // Toggle specialty
  // ---------------------------------------------------------------------------

  const toggleSpecialty = (id: string) => {
    setSelectedSpecialtyIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const onSubmit = async (values: CompanyFormValues) => {
    setErrorMessage(null);

    const parsed = companySchema.parse(values);
    const payload = {
      name: parsed.name,
      description: parsed.description || null,
      address: parsed.address || null,
      phone: parsed.phone || null,
      website: parsed.website || null,
      established_year: parsed.established_year,
      employee_count: parsed.employee_count,
    };

    try {
      if (isEdit) {
        await updateCompany.mutateAsync(payload);
        await updateSpecialties.mutateAsync({
          specialty_ids: selectedSpecialtyIds,
        });
        await refreshCompany();
        setSnackbarOpen(true);
      } else {
        await createCompany.mutateAsync(payload);
        // After creation, update specialties if any selected
        if (selectedSpecialtyIds.length > 0) {
          await updateSpecialties.mutateAsync({
            specialty_ids: selectedSpecialtyIds,
          });
        }
        await refreshCompany();
        setSnackbarOpen(true);
        setShouldNavigate(true);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "エラーが発生しました";
      setErrorMessage(message);
    }
  };

  return (
    <Box>
      <PageHeader
        title="企業情報"
        subtitle={
          isEdit
            ? "企業プロフィールを編集"
            : "企業プロフィールを設定してください"
        }
      />

      {!isEdit && (
        <Alert severity="info" sx={{ mb: 3 }}>
          まず企業情報を登録してください。
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <Grid container spacing={2}>
              {/* name - full width */}
              <Grid size={12}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="企業名"
                      fullWidth
                      required
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>

              {/* description - full width, multiline */}
              <Grid size={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="企業概要"
                      fullWidth
                      multiline
                      rows={4}
                    />
                  )}
                />
              </Grid>

              {/* address */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="住所" fullWidth />
                  )}
                />
              </Grid>

              {/* phone */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="電話番号" fullWidth />
                  )}
                />
              </Grid>

              {/* website */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="website"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Webサイト" fullWidth />
                  )}
                />
              </Grid>

              {/* established_year */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="established_year"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={yearOptions}
                      value={
                        field.value
                          ? yearOptions.find((y) => y.value === Number(field.value)) ?? null
                          : null
                      }
                      onChange={(_, option) => {
                        field.onChange(option ? option.value : "");
                      }}
                      getOptionLabel={(option) => String(option.value)}
                      isOptionEqualToValue={(option, val) =>
                        option.value === val.value
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="設立年"
                          fullWidth
                          error={!!errors.established_year}
                          helperText={errors.established_year?.message}
                        />
                      )}
                      slotProps={{
                        listbox: {
                          sx: { maxHeight: 300 },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              {/* employee_count */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="employee_count"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="従業員数"
                      type="number"
                      fullWidth
                      error={!!errors.employee_count}
                      helperText={errors.employee_count?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Specialties section */}
            {specialtiesLoading ? (
              <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              specialties &&
              specialties.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    専門分野
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {specialties.map((specialty) => {
                      const isSelected = selectedSpecialtyIds.includes(
                        specialty.id,
                      );
                      return (
                        <Chip
                          key={specialty.id}
                          label={specialty.name}
                          color={isSelected ? "primary" : "default"}
                          variant={isSelected ? "filled" : "outlined"}
                          onClick={() => toggleSpecialty(specialty.id)}
                        />
                      );
                    })}
                  </Box>
                </Box>
              )
            )}

            {/* Submit */}
            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} />
                ) : isEdit ? (
                  "更新する"
                ) : (
                  "登録する"
                )}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message="企業情報を保存しました"
      />
    </Box>
  );
}
