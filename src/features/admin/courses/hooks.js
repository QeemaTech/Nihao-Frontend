import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignAdminCourseInstructor,
  createAdminCourse,
  createAdminLesson,
  createAdminUnit,
  deleteAdminCourse,
  deleteAdminLesson,
  deleteAdminUnit,
  fetchAdminCourse,
  fetchAdminCourses,
  fetchAdminUnits,
  updateAdminCourse,
  updateAdminLesson,
  updateAdminUnit,
} from "./api";

export function useAdminCourses(params) {
  return useQuery({
    queryKey: ["admin", "courses", params],
    queryFn: () => fetchAdminCourses(params),
    retry: false,
  });
}

export function useAdminCourse(id) {
  return useQuery({
    queryKey: ["admin", "course", id],
    queryFn: () => fetchAdminCourse(id),
    enabled: !!id,
    retry: false,
  });
}

export function useAdminUnits(params) {
  return useQuery({
    queryKey: ["admin", "units", params],
    queryFn: () => fetchAdminUnits(params),
    retry: false,
  });
}

export function useCreateAdminCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "courses"] }),
  });
}

export function useUpdateAdminCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminCourse,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "course", vars.id] });
    },
  });
}

export function useDeleteAdminCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "courses"] }),
  });
}

export function useCreateAdminUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminUnit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "course"] }),
  });
}

export function useUpdateAdminUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminUnit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "course"] }),
  });
}

export function useDeleteAdminUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminUnit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "course"] }),
  });
}

export function useCreateAdminLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminLesson,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "course"] }),
  });
}

export function useUpdateAdminLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminLesson,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "course"] }),
  });
}

export function useDeleteAdminLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminLesson,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "course"] }),
  });
}

export function useAssignAdminCourseInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignAdminCourseInstructor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "courses"] }),
  });
}
