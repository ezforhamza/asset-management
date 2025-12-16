import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router";
import { useUserInfo } from "@/store/userStore";

interface RoleGuardProps {
	children?: ReactNode;
	allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
	const userInfo = useUserInfo();

	if (!userInfo.role) {
		return <Navigate to="/login" replace />;
	}

	if (!allowedRoles.includes(userInfo.role)) {
		return <Navigate to="/error/403" replace />;
	}

	// If children provided, render them; otherwise render Outlet for nested routes
	return children ? <>{children}</> : <Outlet />;
}
