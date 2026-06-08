import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAvailabilitySlot, deleteAvailabilitySlot, fetchInstructorAvailability } from "./api";

export function useInstructorAvailability() {
  return useQuery({
    queryKey: ["instructor", "availability"],
    queryFn: fetchInstructorAvailability,
  });
}

export function useCreateAvailabilitySlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAvailabilitySlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "availability"] });
    },
  });
}

export function useDeleteAvailabilitySlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAvailabilitySlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "availability"] });
    },
  });
}
