"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { SubcontractorListResponse } from "@/types";

export function useSubcontractors(params?: {
  specialty_id?: string;
  keyword?: string;
  location?: string;
  min_rating?: number;
  page?: number;
  per_page?: number;
}) {
  return useQuery<SubcontractorListResponse>({
    queryKey: ["subcontractors", params],
    queryFn: async () => {
      const { data } = await api.get<SubcontractorListResponse>(
        "/companies/subcontractors",
        { params },
      );
      return data;
    },
  });
}
