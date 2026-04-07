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

	const changePasswordPaths = ["/admin/change-password", "/customer-portal/change-password"];

	// Allow access to change-password pages
	if (changePasswordPaths.includes(location.pathname)) {
		return <>{children}</>;
	}

	// If user must change password, redirect to role-specific page
	if (userInfo.mustChangePassword === true) {
		const changePwPath =
			userInfo.role === UserRole.SYSTEM_ADMIN ? "/admin/change-password" : "/customer-portal/change-password";
		return <Navigate to={changePwPath} replace />;
	}

	return <>{children}</>;
}
