import DashboardLayout from "./DashboardLayout";
import { getAdminNavigation } from "../config/navigation";

function AdminLayout() {
  return <DashboardLayout sidebarSections={getAdminNavigation(7)} />;
}

export default AdminLayout;
