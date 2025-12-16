import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useUserInfo } from "@/store/userStore";

interface MustChangePasswordGuardProps {
	children: ReactNode;
}

/**
 * Guard that redirects users with mustChangePassword=true to the change password page.
 * This ensures new users with temporary passwords must change them before accessing the app.
 */
export function MustChangePasswordGuard({ children }: MustChangePasswordGuardProps) {
	const userInfo = useUserInfo();
	const location = useLocation();

	// Allow access to change-password page
	if (location.pathname === "/change-password") {
		return <>{children}</>;
	}

	// If user must change password, redirect them
	if (userInfo.mustChangePassword === true) {
		return <Navigate to="/change-password" replace />;
	}

	return <>{children}</>;
}
