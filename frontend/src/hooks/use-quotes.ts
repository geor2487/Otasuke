"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import api from "@/lib/api";
import type { QuoteListResponse, QuoteResponse, QuoteCreate } from "@/types";

// ---------------------------------------------------------------------------
// My quotes
// ---------------------------------------------------------------------------

export function useMyQuotes() {
  return useQuery<QuoteListResponse>({
    queryKey: ["my-quotes"],
    queryFn: async () => {
      const { data } = await api.get<QuoteListResponse>("/my-quotes");
      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Submit quote
// ---------------------------------------------------------------------------

export function useSubmitQuote(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<QuoteResponse, Error, QuoteCreate>({
    mutationFn: async (body) => {
      const { data } = await api.post<QuoteResponse>(
        `/projects/${projectId}/quotes`,
        body,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-quotes"] });
      queryClient.invalidateQueries({
        queryKey: ["project-quotes", projectId],
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Accept quote
// ---------------------------------------------------------------------------

export function useAcceptQuote() {
  const queryClient = useQueryClient();

  return useMutation<QuoteResponse, Error, string>({
    mutationFn: async (quoteId) => {
      const { data } = await api.post<QuoteResponse>(
        `/quotes/${quoteId}/accept`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-quotes"] });
      queryClient.invalidateQueries({ queryKey: ["my-quotes"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Reject quote
// ---------------------------------------------------------------------------

export function useRejectQuote() {
  const queryClient = useQueryClient();

  return useMutation<QuoteResponse, Error, string>({
    mutationFn: async (quoteId) => {
      const { data } = await api.post<QuoteResponse>(
        `/quotes/${quoteId}/reject`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-quotes"] });
      queryClient.invalidateQueries({ queryKey: ["my-quotes"] });
    },
  });
}
