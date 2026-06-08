import { useQuery } from "@tanstack/react-query";
import { fetchStudentClasses } from "./api";

export function useStudentClasses(enabled = true) {
  return useQuery({
    queryKey: ["student", "classes"],
    queryFn: fetchStudentClasses,
    enabled,
    retry: false,
  });
}
