"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  ProjectListResponse,
  ProjectResponse,
  ProjectCreate,
  ProjectUpdate,
  QuoteListResponse,
  ProjectFileResponse,
} from "@/types";

// ---------------------------------------------------------------------------
// List projects
// ---------------------------------------------------------------------------

export function useProjects(params?: {
  status?: string;
  company_id?: string;
  specialty_id?: string;
  location?: string;
  page?: number;
  per_page?: number;
}) {
  return useQuery<ProjectListResponse>({
    queryKey: ["projects", params],
    queryFn: async () => {
      const { data } = await api.get<ProjectListResponse>("/projects", {
        params,
      });
      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Single project
// ---------------------------------------------------------------------------

export function useProject(projectId: string) {
  return useQuery<ProjectResponse>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data } = await api.get<ProjectResponse>(
        `/projects/${projectId}`,
      );
      return data;
    },
    enabled: !!projectId,
  });
}

// ---------------------------------------------------------------------------
// Create project
// ---------------------------------------------------------------------------

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation<ProjectResponse, Error, ProjectCreate>({
    mutationFn: async (body) => {
      const { data } = await api.post<ProjectResponse>("/projects", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Update project
// ---------------------------------------------------------------------------

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectResponse, Error, ProjectUpdate>({
    mutationFn: async (body) => {
      const { data } = await api.patch<ProjectResponse>(
        `/projects/${projectId}`,
        body,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}

// ---------------------------------------------------------------------------
// Update project status
// ---------------------------------------------------------------------------

export function useUpdateProjectStatus(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectResponse, Error, { status: string }>({
    mutationFn: async (body) => {
      const { data } = await api.patch<ProjectResponse>(
        `/projects/${projectId}/status`,
        body,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}

// ---------------------------------------------------------------------------
// Upload project file
// ---------------------------------------------------------------------------

export function useUploadProjectFile(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectFileResponse, Error, FormData>({
    mutationFn: async (formData) => {
      const { data } = await api.post<ProjectFileResponse>(
        `/projects/${projectId}/files`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}

// ---------------------------------------------------------------------------
// Project quotes
// ---------------------------------------------------------------------------

export function useProjectQuotes(projectId: string) {
  return useQuery<QuoteListResponse>({
    queryKey: ["project-quotes", projectId],
    queryFn: async () => {
      const { data } = await api.get<QuoteListResponse>(
        `/projects/${projectId}/quotes`,
      );
      return data;
    },
    enabled: !!projectId,
  });
}
