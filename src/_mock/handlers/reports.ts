import { http, HttpResponse, delay } from "msw";
import { MOCK_VERIFICATIONS } from "../data/verifications";
import { MOCK_ASSETS, getMapAssets } from "../data/assets";
import { VerificationStatus } from "#/enum";

export const reportHandlers = [
	// Get verification reports
	http.get("/api/reports/verifications", async ({ request }) => {
		await delay(500);

		const url = new URL(request.url);
		const startDate = url.searchParams.get("startDate");
		const endDate = url.searchParams.get("endDate");
		const status = url.searchParams.get("status") as VerificationStatus | null;
		const verifiedBy = url.searchParams.get("verifiedBy");
		const page = Number(url.searchParams.get("page")) || 1;
		const limit = Number(url.searchParams.get("limit")) || 20;

		let verifications = [...MOCK_VERIFICATIONS];

		// Filter by date range
		if (startDate) {
			verifications = verifications.filter((v) => new Date(v.verifiedAt) >= new Date(startDate));
		}
		if (endDate) {
			verifications = verifications.filter((v) => new Date(v.verifiedAt) <= new Date(endDate));
		}

		// Filter by status (from asset)
		if (status) {
			const assetIds = MOCK_ASSETS.filter((a) => a.verificationStatus === status).map((a) => a._id);
			verifications = verifications.filter((v) => assetIds.includes(v.assetId));
		}

		// Filter by verifiedBy
		if (verifiedBy) {
			verifications = verifications.filter((v) => v.verifiedBy === verifiedBy);
		}

		// Pagination
		const total = verifications.length;
		const startIndex = (page - 1) * limit;
		const paginatedData = verifications.slice(startIndex, startIndex + limit);

		return HttpResponse.json({
			data: paginatedData,
			pagination: {
				total,
				page,
				pages: Math.ceil(total / limit),
			},
		});
	}),

	// Export report (mock - just returns success)
	http.get("/api/reports/export", async ({ request }) => {
		await delay(800);

		const url = new URL(request.url);
		const format = url.searchParams.get("format") || "csv";

		// In real app, this would return a file download
		return HttpResponse.json({
			success: true,
			message: `Report exported as ${format.toUpperCase()}`,
			downloadUrl: `/mock/reports/export_${Date.now()}.${format}`,
		});
	}),

	// Create scheduled report
	http.post("/api/reports/schedules", async () => {
		await delay(500);

		return HttpResponse.json({
			success: true,
			scheduleId: `schedule_${Date.now()}`,
			message: "Report scheduled successfully",
		});
	}),

	// Get scheduled reports
	http.get("/api/reports/schedules", async () => {
		await delay(300);

		return HttpResponse.json([
			{
				_id: "schedule_001",
				frequency: "weekly",
				dayOfWeek: 1,
				recipients: ["admin@assetguard.com"],
				reportType: "verification_summary",
				includeAttachment: true,
				isActive: true,
				lastSent: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
				nextScheduled: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
			},
			{
				_id: "schedule_002",
				frequency: "monthly",
				dayOfMonth: 1,
				recipients: ["admin@assetguard.com", "manager@assetguard.com"],
				reportType: "overdue_assets",
				includeAttachment: true,
				isActive: true,
				lastSent: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
				nextScheduled: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
			},
		]);
	}),

	// Delete scheduled report
	http.delete("/api/reports/schedules/:scheduleId", async () => {
		await delay(300);

		return HttpResponse.json({
			success: true,
			message: "Scheduled report deleted",
		});
	}),

	// Get map assets
	http.get("/api/map/assets", async ({ request }) => {
		await delay(400);

		const url = new URL(request.url);
		const status = url.searchParams.get("status") as VerificationStatus | null;

		let assets = getMapAssets();

		if (status) {
			assets = assets.filter((a) => a.status === status);
		}

		return HttpResponse.json(assets);
	}),
];
