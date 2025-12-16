import { http, HttpResponse, delay } from "msw";
import { MOCK_COMPANIES } from "../data/companies";
import { MOCK_USERS } from "../data/users";
import { MOCK_VERIFICATIONS } from "../data/verifications";
import { MOCK_SYNC_QUEUE, MOCK_AUDIT_LOGS } from "../data/admin";
import { InvestigationStatus } from "#/enum";

export const adminHandlers = [
	// ============================================
	// Admin Dashboard Stats
	// ============================================

	http.get("/api/admin/stats", async () => {
		await delay(100);

		return HttpResponse.json({
			totalCompanies: MOCK_COMPANIES.length,
			activeCompanies: MOCK_COMPANIES.filter((c) => c.isActive).length,
			totalUsers: MOCK_USERS.length,
			totalAssets: 156,
			totalQRCodes: 500,
			availableQRCodes: 245,
			totalVerifications: MOCK_VERIFICATIONS.length,
		});
	}),

	// ============================================
	// Company Management
	// ============================================

	// Get all companies
	http.get("/api/admin/companies", async ({ request }) => {
		await delay(100);

		const url = new URL(request.url);
		const search = url.searchParams.get("search")?.toLowerCase();
		const page = Number(url.searchParams.get("page")) || 1;
		const limit = Number(url.searchParams.get("limit")) || 20;

		let companies = [...MOCK_COMPANIES];

		if (search) {
			companies = companies.filter(
				(c) => c.companyName.toLowerCase().includes(search) || c.contactEmail.toLowerCase().includes(search),
			);
		}

		const total = companies.length;
		const startIndex = (page - 1) * limit;
		const paginatedData = companies.slice(startIndex, startIndex + limit);

		return HttpResponse.json({
			companies: paginatedData,
			pagination: { total, page, pages: Math.ceil(total / limit) },
		});
	}),

	// Get single company with stats
	http.get("/api/admin/companies/:companyId", async ({ params }) => {
		await delay(100);

		const { companyId } = params;
		const company = MOCK_COMPANIES.find((c) => c._id === companyId);

		if (!company) {
			return HttpResponse.json({ success: false, error: "Company not found" }, { status: 404 });
		}

		// Add stats to company
		const companyUsers = MOCK_USERS.filter((u) => u.companyId === companyId);
		return HttpResponse.json({
			...company,
			userCount: companyUsers.length,
			assetCount: 45,
			qrCodeCount: 120,
			verificationCount: 312,
		});
	}),

	// Get company assets
	http.get("/api/admin/companies/:companyId/assets", async ({ params }) => {
		await delay(100);

		const { companyId: _companyId } = params;
		// Mock assets for the company (companyId would filter in real API)
		return HttpResponse.json({
			assets: [
				{
					_id: "asset_001",
					serialNumber: "SN-001234",
					make: "Caterpillar",
					model: "320D",
					verificationStatus: "on_time",
					lastVerifiedAt: "2025-01-08T10:00:00Z",
				},
				{
					_id: "asset_002",
					serialNumber: "SN-001235",
					make: "Komatsu",
					model: "PC200",
					verificationStatus: "due_soon",
					lastVerifiedAt: "2025-01-02T14:30:00Z",
				},
				{
					_id: "asset_003",
					serialNumber: "SN-001236",
					make: "John Deere",
					model: "310L",
					verificationStatus: "overdue",
					lastVerifiedAt: "2024-12-15T09:00:00Z",
				},
				{
					_id: "asset_004",
					serialNumber: "SN-001237",
					make: "Volvo",
					model: "EC220D",
					verificationStatus: "on_time",
					lastVerifiedAt: "2025-01-09T11:15:00Z",
				},
				{
					_id: "asset_005",
					serialNumber: "SN-001238",
					make: "Hitachi",
					model: "ZX200",
					verificationStatus: "on_time",
					lastVerifiedAt: "2025-01-07T16:45:00Z",
				},
			],
		});
	}),

	// Create company - returns temporary password for admin
	http.post("/api/admin/companies", async ({ request }) => {
		await delay(100);

		const body = (await request.json()) as { companyName: string; contactEmail: string };

		// Generate a temporary password
		const tempPassword = `Temp${Math.random().toString(36).slice(2, 8)}@${Math.floor(Math.random() * 100)}`;

		return HttpResponse.json({
			success: true,
			companyId: `company_${Date.now()}`,
			message: `Company "${body.companyName}" created successfully`,
			temporaryPassword: tempPassword,
		});
	}),

	// Update company
	http.put("/api/admin/companies/:companyId", async ({ params }) => {
		await delay(100);

		const { companyId } = params;

		return HttpResponse.json({
			success: true,
			message: `Company ${companyId} updated successfully`,
		});
	}),

	// Deactivate company
	http.put("/api/admin/companies/:companyId/deactivate", async ({ params }) => {
		await delay(100);

		const { companyId } = params;

		return HttpResponse.json({
			success: true,
			message: `Company ${companyId} deactivated`,
		});
	}),

	// Activate company
	http.put("/api/admin/companies/:companyId/activate", async ({ params }) => {
		await delay(100);

		const { companyId } = params;

		return HttpResponse.json({
			success: true,
			message: `Company ${companyId} activated`,
		});
	}),

	// ============================================
	// Admin User Management
	// ============================================

	// Get all users (admin view)
	http.get("/api/admin/users", async ({ request }) => {
		await delay(100);

		const url = new URL(request.url);
		const companyId = url.searchParams.get("companyId");
		const role = url.searchParams.get("role");
		const page = Number(url.searchParams.get("page")) || 1;
		const limit = Number(url.searchParams.get("limit")) || 20;

		let users = [...MOCK_USERS];

		if (companyId) {
			users = users.filter((u) => u.companyId === companyId);
		}

		if (role) {
			users = users.filter((u) => u.role === role);
		}

		const total = users.length;
		const startIndex = (page - 1) * limit;
		const paginatedData = users.slice(startIndex, startIndex + limit);

		return HttpResponse.json({
			users: paginatedData,
			pagination: { total, page, pages: Math.ceil(total / limit) },
		});
	}),

	// Create superuser for company
	http.post("/api/admin/users/create-superuser", async ({ request }) => {
		await delay(100);

		const body = (await request.json()) as { name: string; email: string; companyId: string };

		return HttpResponse.json({
			success: true,
			userId: `user_${Date.now()}`,
			temporaryPassword: "TempAdmin123!",
			message: `Superuser "${body.name}" created for company`,
		});
	}),

	// Assign user to company
	http.put("/api/admin/users/:userId/assign-company", async ({ params }) => {
		await delay(100);

		const { userId } = params;

		return HttpResponse.json({
			success: true,
			message: `User ${userId} assigned to company`,
		});
	}),

	// ============================================
	// System Monitoring
	// ============================================

	// Get monitoring stats
	http.get("/api/admin/monitoring", async () => {
		await delay(100);

		const queuedUploads = MOCK_SYNC_QUEUE.filter((s) => s.syncStatus === "pending").length;
		const failedSyncs = MOCK_SYNC_QUEUE.filter((s) => s.syncStatus === "failed").length;
		const flaggedVerifications = MOCK_VERIFICATIONS.filter(
			(v) => v.investigationStatus === InvestigationStatus.OPEN,
		).length;

		return HttpResponse.json({
			queuedUploads,
			failedSyncs,
			flaggedVerifications,
			apiResponseTime: Math.floor(Math.random() * 100) + 150,
			dbConnections: Math.floor(Math.random() * 5) + 3,
		});
	}),

	// Get sync queue
	http.get("/api/admin/sync-queue", async ({ request }) => {
		await delay(100);

		const url = new URL(request.url);
		const status = url.searchParams.get("status");
		const page = Number(url.searchParams.get("page")) || 1;
		const limit = Number(url.searchParams.get("limit")) || 20;

		let items = [...MOCK_SYNC_QUEUE];

		if (status) {
			items = items.filter((s) => s.syncStatus === status);
		}

		const total = items.length;
		const startIndex = (page - 1) * limit;
		const paginatedData = items.slice(startIndex, startIndex + limit);

		return HttpResponse.json({
			items: paginatedData,
			pagination: { total, page, pages: Math.ceil(total / limit) },
		});
	}),

	// Retry sync item
	http.post("/api/admin/sync-queue/:syncId/retry", async ({ params }) => {
		await delay(100);

		const { syncId } = params;

		return HttpResponse.json({
			success: true,
			message: `Sync item ${syncId} queued for retry`,
		});
	}),

	// Get flagged verifications
	http.get("/api/admin/flagged-verifications", async ({ request }) => {
		await delay(100);

		const url = new URL(request.url);
		const page = Number(url.searchParams.get("page")) || 1;
		const limit = Number(url.searchParams.get("limit")) || 20;

		const flagged = MOCK_VERIFICATIONS.filter((v) => v.investigationStatus !== null);

		const total = flagged.length;
		const startIndex = (page - 1) * limit;
		const paginatedData = flagged.slice(startIndex, startIndex + limit);

		return HttpResponse.json({
			verifications: paginatedData,
			pagination: { total, page, pages: Math.ceil(total / limit) },
		});
	}),

	// ============================================
	// Audit Logs
	// ============================================

	// Get audit logs
	http.get("/api/admin/audit-logs", async ({ request }) => {
		await delay(100);

		const url = new URL(request.url);
		const entityType = url.searchParams.get("entityType");
		const page = Number(url.searchParams.get("page")) || 1;
		const limit = Number(url.searchParams.get("limit")) || 20;

		let logs = [...MOCK_AUDIT_LOGS];

		if (entityType) {
			logs = logs.filter((l) => l.entityType === entityType);
		}

		const total = logs.length;
		const startIndex = (page - 1) * limit;
		const paginatedData = logs.slice(startIndex, startIndex + limit);

		return HttpResponse.json({
			logs: paginatedData,
			pagination: { total, page, pages: Math.ceil(total / limit) },
		});
	}),

	// ============================================
	// Global Settings
	// ============================================

	// Get global settings
	http.get("/api/admin/settings", async () => {
		await delay(100);

		return HttpResponse.json({
			defaultVerificationFrequency: 30,
			geofenceThreshold: 50,
			allowOverride: true,
			imageRetentionDays: 365,
			maxImageSize: 5,
			requirePhotoOnVerification: true,
			enableOfflineMode: true,
			offlineSyncInterval: 5,
		});
	}),

	// Update global settings
	http.put("/api/admin/settings", async () => {
		await delay(100);

		return HttpResponse.json({ success: true });
	}),
];
