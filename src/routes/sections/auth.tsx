import { lazy, Suspense } from "react";
import { Navigate, Outlet } from "react-router";
import type { RouteObject } from "react-router";

const AdminLoginPage = lazy(() => import("@/pages/sys/login/admin-login"));
const CustomerLoginPage = lazy(() => import("@/pages/sys/login/customer-login"));

export const authRoutes: RouteObject[] = [
	{
		// Legacy route - redirect old /auth/login to customer portal login
		path: "auth",
		element: (
			<Suspense>
				<Outlet />
			</Suspense>
		),
		children: [{ path: "login", element: <Navigate to="/customer-portal/login" replace /> }],
	},
	{
		// System Admin login at /admin/login
		path: "admin",
		element: (
			<Suspense fallback={null}>
				<Outlet />
			</Suspense>
		),
		children: [{ path: "login", element: <AdminLoginPage /> }],
	},
	{
		// Customer Admin login at /customer-portal/login
		path: "customer-portal",
		element: (
			<Suspense fallback={null}>
				<Outlet />
			</Suspense>
		),
		children: [{ path: "login", element: <CustomerLoginPage /> }],
	},
];
