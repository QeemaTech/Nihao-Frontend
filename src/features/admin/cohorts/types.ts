export type CohortType = "LIVE" | "RECORDED";

export type CohortStatus = "UPCOMING" | "ONGOING" | "COMPLETED";

export type AdminCohortListItem = {
  id: string;
  name: string;
  type: CohortType;
  status: CohortStatus;
  startDate: string | null;
  endDate: string | null;
  price: number;
  courseId: string;
  instructorId: string;
  instructor?: { fullName?: string | null; avatar?: string | null };
  course?: { id: string; title: string };
};

export type AdminCohortListResponse = {
  classes: AdminCohortListItem[];
  total: number;
  page: number;
  limit: number;
};

export type AdminCohortDetail = AdminCohortListItem & {
  enrollments?: Array<{
    id: string;
    student: { id: string; fullName: string | null; avatar?: string | null };
  }>;
};

export type AdminCohortListParams = {
  page?: number;
  limit?: number;
  instructorId?: string;
  courseId?: string;
  type?: CohortType;
};

export type CreateCohortInput = {
  name: string;
  type: CohortType;
  status?: CohortStatus;
  courseId: string;
  instructorId: string;
  startDate: string;
  endDate?: string | null;
  price: number;
};

export type UpdateCohortInput = Partial<Omit<CreateCohortInput, "startDate" | "endDate">> & {
  startDate?: string | null;
  endDate?: string | null;
};
