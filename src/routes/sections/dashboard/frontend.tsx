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
		{
			path: "customer-portal",
			children: [
				{ index: true, element: <Navigate to="dashboard" replace /> },
				{ path: "dashboard", element: Component("/pages/dashboard") },
				{ path: "assets", element: Component("/pages/assets") },
				{ path: "assets/:assetId/history", element: Component("/pages/assets/history") },
				{
					path: "asset-movements",
					element: (
						<RoleGuard allowedRoles={[UserRole.CUSTOMER_ADMIN]}>{Component("/pages/asset-movements")}</RoleGuard>
					),
				},
				{ path: "reports", element: Component("/pages/reports") },
				{ path: "map", element: Component("/pages/map") },
				{ path: "change-password", element: Component("/pages/sys/change-password") },
				{
					path: "repair-requests",
					element: (
						<RoleGuard allowedRoles={[UserRole.CUSTOMER_ADMIN]}>{Component("/pages/repair-requests")}</RoleGuard>
					),
				},

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
			],
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
				{ path: "super-users", element: Component("/pages/admin/super-users") },
				{ path: "change-password", element: Component("/pages/sys/change-password") },
			],
		},

		// ============================================
		// Super User Portal
		// ============================================
		{
			path: "super-user",
			element: <RoleGuard allowedRoles={[UserRole.SUPER_USER]} />,
			children: [
				{ index: true, element: <Navigate to="dashboard" replace /> },
				{ path: "dashboard", element: Component("/pages/super-user/dashboard") },
				{ path: "companies", element: Component("/pages/super-user/companies") },
				{ path: "companies/:companyId/assets", element: Component("/pages/super-user/assets") },
				{ path: "companies/:companyId/assets/:assetId", element: Component("/pages/super-user/assets/detail") },
				{ path: "companies/:companyId/users", element: Component("/pages/super-user/companies/users") },
				{ path: "asset-movements", element: Component("/pages/super-user/asset-movements") },
				{ path: "reports", element: Component("/pages/super-user/reports") },
				{ path: "map", element: Component("/pages/super-user/map") },
				{ path: "repair-requests", element: Component("/pages/super-user/repair-requests") },
				{ path: "profile", element: Component("/pages/super-user/profile") },
				{ path: "change-password", element: Component("/pages/sys/change-password") },
			],
		},

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
