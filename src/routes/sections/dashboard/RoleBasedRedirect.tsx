import { Navigate } from "react-router";
import { UserRole } from "#/enum";
import { useUserInfo } from "@/store/userStore";

export function RoleBasedRedirect() {
	const userInfo = useUserInfo();

	if (userInfo.role === UserRole.SYSTEM_ADMIN) {
		return <Navigate to="/admin/dashboard" replace />;
	}

	if (userInfo.role === UserRole.SUPER_USER) {
		return <Navigate to="/super-user/dashboard" replace />;
	}

	return <Navigate to="/customer-portal/dashboard" replace />;
}
