"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  MenuItem,
  TextField,
} from "@mui/material";
import { useSpecialties } from "@/hooks/use-companies";
import type { ProjectCreate, ProjectUpdate } from "@/types";

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const projectSchema = z.object({
  title: z.string().min(1, "案件名は必須です"),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  budget_min: z.coerce
    .number()
    .positive("0より大きい値を入力してください")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((v) => (v === "" || v === undefined ? null : v)),
  budget_max: z.coerce
    .number()
    .positive("0より大きい値を入力してください")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((v) => (v === "" || v === undefined ? null : v)),
  deadline: z.string().optional().nullable(),
  required_specialty_id: z.string().optional().nullable(),
});

type ProjectFormValues = z.input<typeof projectSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type ProjectFormProps = {
  defaultValues?: ProjectUpdate;
  onSubmit: (data: ProjectCreate | ProjectUpdate) => Promise<void>;
  isLoading: boolean;
  submitLabel: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProjectForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel,
}: ProjectFormProps) {
  const { data: specialties } = useSpecialties();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      location: defaultValues?.location ?? "",
      budget_min: defaultValues?.budget_min ?? "",
      budget_max: defaultValues?.budget_max ?? "",
      deadline: defaultValues?.deadline ?? "",
      required_specialty_id: defaultValues?.required_specialty_id ?? "",
    },
  });

  const submit = handleSubmit(async (values) => {
    const cleaned: ProjectCreate | ProjectUpdate = {
      title: values.title,
      description: values.description || null,
      location: values.location || null,
      budget_min:
        values.budget_min === "" || values.budget_min == null
          ? null
          : Number(values.budget_min),
      budget_max:
        values.budget_max === "" || values.budget_max == null
          ? null
          : Number(values.budget_max),
      deadline: values.deadline || null,
      required_specialty_id: values.required_specialty_id || null,
    };
    await onSubmit(cleaned);
  });

  return (
    <Card>
      <CardContent>
        <Box component="form" onSubmit={submit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="案件名"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    label="説明"
                    fullWidth
                    multiline
                    rows={4}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    label="場所"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="budget_min"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    label="予算下限 (円)"
                    type="number"
                    fullWidth
                    error={!!errors.budget_min}
                    helperText={errors.budget_min?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="budget_max"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    label="予算上限 (円)"
                    type="number"
                    fullWidth
                    error={!!errors.budget_max}
                    helperText={errors.budget_max?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="deadline"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    label="期限"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="required_specialty_id"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    select
                    label="必要な専門分野"
                    fullWidth
                  >
                    <MenuItem value="">未選択</MenuItem>
                    {specialties?.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  startIcon={
                    isLoading ? <CircularProgress size={20} /> : undefined
                  }
                >
                  {submitLabel}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
}
