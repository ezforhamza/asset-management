import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { UserRole } from "#/enum";
import { useUserInfo } from "@/store/userStore";

interface MustChangePasswordGuardProps {
	children: ReactNode;
}

/**
 * Guard that redirects users with mustChangePassword=true to their role-specific change password page.
 */
export function MustChangePasswordGuard({ children }: MustChangePasswordGuardProps) {
	const userInfo = useUserInfo();
	const location = useLocation();

	const changePasswordPaths = [
		"/admin/change-password",
		"/customer-portal/change-password",
		"/super-user/change-password",
	];

	if (changePasswordPaths.includes(location.pathname)) {
		return <>{children}</>;
	}

	if (userInfo.mustChangePassword === true) {
		let changePwPath = "/customer-portal/change-password";
		if (userInfo.role === UserRole.SYSTEM_ADMIN) changePwPath = "/admin/change-password";
		else if (userInfo.role === UserRole.SUPER_USER) changePwPath = "/super-user/change-password";
		return <Navigate to={changePwPath} replace />;
	}

	return <>{children}</>;
}
