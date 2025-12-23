import { Navigate } from "react-router";
import { useUserInfo } from "@/store/userStore";
import { UserRole } from "#/enum";

/**
 * Redirects users to their appropriate dashboard based on role
 * - SYSTEM_ADMIN -> /admin/dashboard
 * - CUSTOMER_ADMIN / FIELD_USER -> /dashboard
 */
export function RoleBasedRedirect() {
	const userInfo = useUserInfo();

	if (userInfo.role === UserRole.SYSTEM_ADMIN) {
		return <Navigate to="/admin/dashboard" replace />;
	}

	return <Navigate to="/dashboard" replace />;
}
