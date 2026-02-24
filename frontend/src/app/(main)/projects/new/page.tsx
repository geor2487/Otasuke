"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Snackbar } from "@mui/material";
import { PageHeader } from "@/components/common";
import ProjectForm from "@/components/projects/ProjectForm";
import { useCreateProject } from "@/hooks/use-projects";
import type { ProjectCreate, ProjectUpdate } from "@/types";

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useCreateProject();
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (data: ProjectCreate | ProjectUpdate) => {
    try {
      setErrorMessage(null);
      await createProject.mutateAsync(data as ProjectCreate);
      setSuccessOpen(true);
      router.push("/projects");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "案件の作成に失敗しました";
      setErrorMessage(message);
    }
  };

  return (
    <>
      <PageHeader title="新規案件作成" />

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <ProjectForm
        onSubmit={handleSubmit}
        isLoading={createProject.isPending}
        submitLabel="作成する"
      />

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        message="案件を作成しました"
      />
    </>
  );
}
