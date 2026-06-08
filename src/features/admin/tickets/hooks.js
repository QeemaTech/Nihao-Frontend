import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAdminTicketById, fetchAdminTickets, processAdminTicket, replyAdminTicket } from "./api";

export function useAdminTickets(params) {
  return useQuery({
    queryKey: ["admin", "tickets", params],
    queryFn: () => fetchAdminTickets(params),
    retry: false,
  });
}

export function useProcessAdminTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: processAdminTicket,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] }),
  });
}

export function useAdminTicketById(id) {
  return useQuery({
    queryKey: ["admin", "tickets", id],
    queryFn: () => fetchAdminTicketById(id),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useReplyAdminTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: replyAdminTicket,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets", variables?.id] });
    },
  });
}

