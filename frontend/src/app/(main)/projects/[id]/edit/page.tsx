"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert, Box, CircularProgress, Snackbar } from "@mui/material";
import { PageHeader } from "@/components/common";
import ProjectForm from "@/components/projects/ProjectForm";
import { useProject, useUpdateProject } from "@/hooks/use-projects";
import type { ProjectCreate, ProjectUpdate } from "@/types";

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: project, isLoading } = useProject(id);
  const updateProject = useUpdateProject(id);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (data: ProjectCreate | ProjectUpdate) => {
    try {
      setErrorMessage(null);
      await updateProject.mutateAsync(data);
      setSuccessOpen(true);
      router.push(`/projects/${id}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "案件の更新に失敗しました";
      setErrorMessage(message);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return <Alert severity="error">案件が見つかりませんでした。</Alert>;
  }

  return (
    <>
      <PageHeader title="案件編集" />

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <ProjectForm
        defaultValues={{
          title: project.title,
          description: project.description,
          location: project.location,
          budget_min: project.budget_min,
          budget_max: project.budget_max,
          deadline: project.deadline,
          required_specialty_id: project.required_specialty_id,
        }}
        onSubmit={handleSubmit}
        isLoading={updateProject.isPending}
        submitLabel="更新する"
      />

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        message="案件を更新しました"
      />
    </>
  );
}
