import { http, HttpResponse, delay } from "msw";
import { getDashboardStats, getRecentActivity } from "../data/verifications";

export const dashboardHandlers = [
	// Get dashboard stats
	http.get("/api/dashboard/stats", async () => {
		await delay(300);

		const stats = getDashboardStats();
		return HttpResponse.json(stats);
	}),

	// Get recent activity
	http.get("/api/dashboard/recent-activity", async ({ request }) => {
		await delay(400);

		const url = new URL(request.url);
		const limit = Number(url.searchParams.get("limit")) || 10;

		const activity = getRecentActivity(limit);
		return HttpResponse.json(activity);
	}),
];
