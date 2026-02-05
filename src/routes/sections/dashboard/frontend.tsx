import type { RouteObject } from "react-router";
import { Navigate } from "react-router";
import { UserRole } from "#/enum";
import { RoleGuard } from "@/routes/guards/RoleGuard";
import { Component } from "./utils";

export function getFrontendDashboardRoutes(): RouteObject[] {
	const frontendDashboardRoutes: RouteObject[] = [
		// ============================================
		// Client Panel Pages (Customer Admin & Field User)
		// ============================================
		{ path: "dashboard", element: Component("/pages/dashboard") },
		{ path: "assets", element: Component("/pages/assets") },
		{ path: "assets/:assetId/history", element: Component("/pages/assets/history") },
		{
			path: "asset-movements",
			element: <RoleGuard allowedRoles={[UserRole.CUSTOMER_ADMIN]}>{Component("/pages/asset-movements")}</RoleGuard>,
		},
		{ path: "reports", element: Component("/pages/reports") },
		{ path: "map", element: Component("/pages/map") },

		// Management pages (Customer Admin only)
		{
			path: "users",
			element: <RoleGuard allowedRoles={[UserRole.CUSTOMER_ADMIN]}>{Component("/pages/users")}</RoleGuard>,
		},
		{
			path: "users/:userId",
			element: <RoleGuard allowedRoles={[UserRole.CUSTOMER_ADMIN]}>{Component("/pages/users/detail")}</RoleGuard>,
		},
		{
			path: "settings",
			element: <RoleGuard allowedRoles={[UserRole.CUSTOMER_ADMIN]}>{Component("/pages/settings")}</RoleGuard>,
		},

		// ============================================
		// Admin Panel Pages (System Admin only)
		// ============================================
		{
			path: "admin",
			element: <RoleGuard allowedRoles={[UserRole.SYSTEM_ADMIN]} />,
			children: [
				{ index: true, element: <Navigate to="dashboard" replace /> },
				{ path: "dashboard", element: Component("/pages/admin/dashboard") },
				{ path: "companies", element: Component("/pages/admin/companies") },
				{ path: "companies/:companyId", element: Component("/pages/admin/companies/detail") },
				{ path: "qr-inventory", element: Component("/pages/admin/qr-inventory") },
				{ path: "monitoring", element: Component("/pages/admin/monitoring") },
				{ path: "audit-logs", element: Component("/pages/admin/audit-logs") },
				{ path: "audit-logs/:id", element: Component("/pages/admin/audit-logs/detail") },
				{ path: "settings", element: Component("/pages/admin/settings") },
			],
		},

		// ============================================
		// Common Pages
		// ============================================
		{ path: "change-password", element: Component("/pages/sys/change-password") },

		// Error pages
		{
			path: "error",
			children: [
				{ index: true, element: <Navigate to="403" replace /> },
				{ path: "403", element: Component("/pages/sys/error/Page403") },
				{ path: "404", element: Component("/pages/sys/error/Page404") },
				{ path: "500", element: Component("/pages/sys/error/Page500") },
			],
		},
	];
	return frontendDashboardRoutes;
}
