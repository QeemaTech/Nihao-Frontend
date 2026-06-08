import { Navigate, Route } from "react-router-dom";
import { APP_ROLES } from "../config/permissions";
import GuardedRoute from "./guardedRoute";
import InstructorLayout from "../layouts/InstructorLayout";
import InstructorOverview from "../pages/instructor/Overview";
import InstructorCohorts from "../pages/instructor/Cohorts";
import InstructorExams from "../pages/instructor/Exams";
import InstructorExamDetailPage from "../pages/instructor/ExamDetail";
import InstructorStudents from "../pages/instructor/Students";
import InstructorStudentDetail from "../pages/instructor/StudentDetail";
import InstructorQna from "../pages/instructor/Qna";
import InstructorWallet from "../pages/instructor/Wallet";
import InstructorPerformance from "../pages/instructor/Performance";
import InstructorHomework from "../pages/instructor/Homework";
import InstructorAvailability from "../pages/instructor/Availability";
import InstructorSettings from "../pages/instructor/Settings";

function InstructorRoutes() {
  return (
    <Route element={<GuardedRoute allowedRoles={[APP_ROLES.INSTRUCTOR]} />}>
      <Route path="/instructor" element={<InstructorLayout />}>
        <Route index element={<InstructorOverview />} />
        <Route path="classes" element={<Navigate to="/instructor/cohorts" replace />} />
        <Route path="cohorts" element={<InstructorCohorts />} />
        <Route path="homework" element={<InstructorHomework />} />
        <Route path="availability" element={<InstructorAvailability />} />
        <Route path="exams" element={<InstructorExams />} />
        <Route path="exams/:examId" element={<InstructorExamDetailPage />} />
        <Route path="students" element={<InstructorStudents />} />
        <Route path="students/:id" element={<InstructorStudentDetail />} />
        <Route path="qna" element={<InstructorQna />} />
        <Route path="wallet" element={<InstructorWallet />} />
        <Route path="performance" element={<InstructorPerformance />} />
        <Route path="settings" element={<InstructorSettings />} />
      </Route>
    </Route>
  );
}

export default InstructorRoutes;
