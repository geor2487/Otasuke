"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  DirectOrderCreate,
  DirectOrderDecline,
  DirectOrderListResponse,
  DirectOrderResponse,
} from "@/types";

export function useDirectOrders(status?: string) {
  return useQuery<DirectOrderListResponse>({
    queryKey: ["direct-orders", status],
    queryFn: async () => {
      const { data } = await api.get<DirectOrderListResponse>(
        "/direct-orders",
        { params: status ? { status } : undefined },
      );
      return data;
    },
  });
}

export function useDirectOrder(id: string) {
  return useQuery<DirectOrderResponse>({
    queryKey: ["direct-order", id],
    queryFn: async () => {
      const { data } = await api.get<DirectOrderResponse>(
        `/direct-orders/${id}`,
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateDirectOrder() {
  const queryClient = useQueryClient();

  return useMutation<DirectOrderResponse, Error, DirectOrderCreate>({
    mutationFn: async (body) => {
      const { data } = await api.post<DirectOrderResponse>(
        "/direct-orders",
        body,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["direct-orders"] });
    },
  });
}

export function useAcceptDirectOrder() {
  const queryClient = useQueryClient();

  return useMutation<DirectOrderResponse, Error, string>({
    mutationFn: async (id) => {
      const { data } = await api.post<DirectOrderResponse>(
        `/direct-orders/${id}/accept`,
      );
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["direct-orders"] });
      queryClient.invalidateQueries({ queryKey: ["direct-order", id] });
    },
  });
}

export function useDeclineDirectOrder() {
  const queryClient = useQueryClient();

  return useMutation<
    DirectOrderResponse,
    Error,
    { id: string; body?: DirectOrderDecline }
  >({
    mutationFn: async ({ id, body }) => {
      const { data } = await api.post<DirectOrderResponse>(
        `/direct-orders/${id}/decline`,
        body ?? {},
      );
      return data;
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["direct-orders"] });
      queryClient.invalidateQueries({ queryKey: ["direct-order", id] });
    },
  });
}

export function useStartDirectOrder() {
  const queryClient = useQueryClient();

  return useMutation<DirectOrderResponse, Error, string>({
    mutationFn: async (id) => {
      const { data } = await api.post<DirectOrderResponse>(
        `/direct-orders/${id}/start`,
      );
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["direct-orders"] });
      queryClient.invalidateQueries({ queryKey: ["direct-order", id] });
    },
  });
}

export function useCompleteDirectOrder() {
  const queryClient = useQueryClient();

  return useMutation<DirectOrderResponse, Error, string>({
    mutationFn: async (id) => {
      const { data } = await api.post<DirectOrderResponse>(
        `/direct-orders/${id}/complete`,
      );
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["direct-orders"] });
      queryClient.invalidateQueries({ queryKey: ["direct-order", id] });
    },
  });
}

export function useCancelDirectOrder() {
  const queryClient = useQueryClient();

  return useMutation<DirectOrderResponse, Error, string>({
    mutationFn: async (id) => {
      const { data } = await api.post<DirectOrderResponse>(
        `/direct-orders/${id}/cancel`,
      );
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["direct-orders"] });
      queryClient.invalidateQueries({ queryKey: ["direct-order", id] });
    },
  });
}
