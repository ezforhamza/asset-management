import type { RouteObject } from "react-router";
import { Navigate } from "react-router";
import { Component } from "./utils";

export function getFrontendDashboardRoutes(): RouteObject[] {
	const frontendDashboardRoutes: RouteObject[] = [
		// Main pages
		{ path: "dashboard", element: Component("/pages/dashboard") },
		{ path: "reports", element: Component("/pages/reports") },
		{ path: "map", element: Component("/pages/map") },

		// Management pages (Customer Admin only)
		{ path: "users", element: Component("/pages/users") },
		{ path: "settings", element: Component("/pages/settings") },

		// Auth pages
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
