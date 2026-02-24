"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  SpecialtyResponse,
  CompanyWithSpecialtiesResponse,
  CompanyCreate,
  CompanyUpdate,
  ReviewListResponse,
} from "@/types";

// ---------------------------------------------------------------------------
// Specialties
// ---------------------------------------------------------------------------

export function useSpecialties() {
  return useQuery<SpecialtyResponse[]>({
    queryKey: ["specialties"],
    queryFn: async () => {
      const { data } = await api.get<SpecialtyResponse[]>(
        "/companies/specialties",
      );
      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Single company
// ---------------------------------------------------------------------------

export function useCompany(companyId: string) {
  return useQuery<CompanyWithSpecialtiesResponse>({
    queryKey: ["company", companyId],
    queryFn: async () => {
      const { data } = await api.get<CompanyWithSpecialtiesResponse>(
        `/companies/${companyId}`,
      );
      return data;
    },
    enabled: !!companyId,
  });
}

// ---------------------------------------------------------------------------
// Create company (POST /companies/me)
// ---------------------------------------------------------------------------

export function useCreateCompany() {
  return useMutation<CompanyWithSpecialtiesResponse, Error, CompanyCreate>({
    mutationFn: async (body) => {
      const { data } = await api.post<CompanyWithSpecialtiesResponse>(
        "/companies/me",
        body,
      );
      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Update company (PATCH /companies/me)
// ---------------------------------------------------------------------------

export function useUpdateCompany() {
  return useMutation<CompanyWithSpecialtiesResponse, Error, CompanyUpdate>({
    mutationFn: async (body) => {
      const { data } = await api.patch<CompanyWithSpecialtiesResponse>(
        "/companies/me",
        body,
      );
      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Update specialties (PUT /companies/me/specialties)
// ---------------------------------------------------------------------------

export function useUpdateSpecialties() {
  return useMutation<void, Error, { specialty_ids: string[] }>({
    mutationFn: async (body) => {
      await api.put("/companies/me/specialties", body);
    },
  });
}

// ---------------------------------------------------------------------------
// Company reviews
// ---------------------------------------------------------------------------

export function useCompanyReviews(companyId: string) {
  return useQuery<ReviewListResponse>({
    queryKey: ["companyReviews", companyId],
    queryFn: async () => {
      const { data } = await api.get<ReviewListResponse>(
        `/companies/${companyId}/reviews`,
      );
      return data;
    },
    enabled: !!companyId,
  });
}
