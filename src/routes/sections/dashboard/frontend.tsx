import type { RouteObject } from "react-router";
import { Navigate } from "react-router";
import { Component } from "./utils";

export function getFrontendDashboardRoutes(): RouteObject[] {
	const frontendDashboardRoutes: RouteObject[] = [
		// Dashboard routes
		{ path: "workbench", element: Component("/pages/dashboard/workbench") },
		{ path: "analysis", element: Component("/pages/dashboard/analysis") },

		// Management routes
		{
			path: "management",
			children: [
				{ index: true, element: <Navigate to="user" replace /> },
				{
					path: "user",
					children: [
						{ index: true, element: <Navigate to="profile" replace /> },
						{ path: "profile", element: Component("/pages/management/user/profile") },
						{ path: "account", element: Component("/pages/management/user/account") },
					],
				},
				{
					path: "system",
					children: [
						{ index: true, element: <Navigate to="permission" replace /> },
						{ path: "permission", element: Component("/pages/management/system/permission") },
						{ path: "role", element: Component("/pages/management/system/role") },
						{ path: "user", element: Component("/pages/management/system/user") },
						{ path: "user/:id", element: Component("/pages/management/system/user/detail") },
					],
				},
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

		// Permission demo (optional - can be removed later if not needed)
		{
			path: "permission",
			children: [
				{ index: true, element: Component("/pages/sys/others/permission") },
				{ path: "page-test", element: Component("/pages/sys/others/permission/page-test") },
			],
		},
	];
	return frontendDashboardRoutes;
}
