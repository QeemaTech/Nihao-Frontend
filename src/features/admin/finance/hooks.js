import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCoupons, fetchPayments, fetchPayouts, processPayout, updateAdminPaymentStatus } from "./api";

export function useAdminPayments(params) {
  return useQuery({
    queryKey: ["admin", "finance", "payments", params],
    queryFn: () => fetchPayments(params),
    retry: false,
  });
}

export function useAdminCoupons(params) {
  return useQuery({
    queryKey: ["admin", "finance", "coupons", params],
    queryFn: () => fetchCoupons(params),
    retry: false,
  });
}

export function useAdminPayouts(params) {
  return useQuery({
    queryKey: ["admin", "finance", "payouts", params],
    queryFn: () => fetchPayouts(params),
    retry: false,
  });
}

export function useProcessPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: processPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "finance", "payouts"] });
      queryClient.invalidateQueries({ queryKey: ["instructor", "wallet"] });
    },
  });
}

export function useUpdateAdminPaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminPaymentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "finance", "payments"] });
    },
  });
}
