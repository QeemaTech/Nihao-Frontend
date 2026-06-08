import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAdminCertificates, issueAdminCertificate } from "./api";

const CERTIFICATES_KEY = ["admin", "certificates"];

export function useAdminCertificates(params = {}) {
  return useQuery({
    queryKey: [...CERTIFICATES_KEY, params],
    queryFn: () => fetchAdminCertificates(params),
    retry: false,
  });
}

export function useIssueAdminCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: issueAdminCertificate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CERTIFICATES_KEY }),
  });
}

