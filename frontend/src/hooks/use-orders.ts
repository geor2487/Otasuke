"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  OrderListResponse,
  OrderResponse,
  ReviewCreate,
  ReviewResponse,
} from "@/types";

// ---------------------------------------------------------------------------
// List orders
// ---------------------------------------------------------------------------

export function useOrders() {
  return useQuery<OrderListResponse>({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await api.get<OrderListResponse>("/orders");
      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Single order
// ---------------------------------------------------------------------------

export function useOrder(orderId: string) {
  return useQuery<OrderResponse>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data } = await api.get<OrderResponse>(`/orders/${orderId}`);
      return data;
    },
    enabled: !!orderId,
  });
}

// ---------------------------------------------------------------------------
// Complete order
// ---------------------------------------------------------------------------

export function useCompleteOrder() {
  const queryClient = useQueryClient();

  return useMutation<OrderResponse, Error, string>({
    mutationFn: async (orderId) => {
      const { data } = await api.post<OrderResponse>(
        `/orders/${orderId}/complete`,
      );
      return data;
    },
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Create review for order
// ---------------------------------------------------------------------------

export function useCreateReview(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation<ReviewResponse, Error, ReviewCreate>({
    mutationFn: async (body) => {
      const { data } = await api.post<ReviewResponse>(
        `/orders/${orderId}/reviews`,
        body,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
