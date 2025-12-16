import { http, HttpResponse, delay } from "msw";
import { MOCK_COMPANY_ID } from "../data/users";

// QR Code Status enum
export enum QRCodeStatus {
	AVAILABLE = "available",
	ALLOCATED = "allocated",
	USED = "used",
	RETIRED = "retired",
}

// Mock QR codes data
export const MOCK_QR_CODES = [
	{
		_id: "qr_001",
		qrCode: "QR-AG-001",
		companyId: MOCK_COMPANY_ID,
		assetId: "asset_001",
		status: QRCodeStatus.USED,
		allocatedAt: "2024-06-01T00:00:00Z",
		linkedAt: "2024-06-15T00:00:00Z",
		createdAt: "2024-01-01T00:00:00Z",
	},
	{
		_id: "qr_002",
		qrCode: "QR-AG-002",
		companyId: MOCK_COMPANY_ID,
		assetId: "asset_002",
		status: QRCodeStatus.USED,
		allocatedAt: "2024-06-01T00:00:00Z",
		linkedAt: "2024-06-20T00:00:00Z",
		createdAt: "2024-01-01T00:00:00Z",
	},
	{
		_id: "qr_003",
		qrCode: "QR-AG-003",
		companyId: MOCK_COMPANY_ID,
		assetId: "asset_003",
		status: QRCodeStatus.USED,
		allocatedAt: "2024-06-01T00:00:00Z",
		linkedAt: "2024-06-25T00:00:00Z",
		createdAt: "2024-01-01T00:00:00Z",
	},
	{
		_id: "qr_004",
		qrCode: "QR-AG-004",
		companyId: MOCK_COMPANY_ID,
		assetId: null,
		status: QRCodeStatus.ALLOCATED,
		allocatedAt: "2024-06-01T00:00:00Z",
		linkedAt: null,
		createdAt: "2024-01-01T00:00:00Z",
	},
	{
		_id: "qr_005",
		qrCode: "QR-AG-005",
		companyId: MOCK_COMPANY_ID,
		assetId: null,
		status: QRCodeStatus.ALLOCATED,
		allocatedAt: "2024-06-01T00:00:00Z",
		linkedAt: null,
		createdAt: "2024-01-01T00:00:00Z",
	},
	{
		_id: "qr_006",
		qrCode: "QR-AG-006",
		companyId: null,
		assetId: null,
		status: QRCodeStatus.AVAILABLE,
		allocatedAt: null,
		linkedAt: null,
		createdAt: "2024-01-01T00:00:00Z",
	},
	{
		_id: "qr_007",
		qrCode: "QR-AG-007",
		companyId: null,
		assetId: null,
		status: QRCodeStatus.AVAILABLE,
		allocatedAt: null,
		linkedAt: null,
		createdAt: "2024-01-01T00:00:00Z",
	},
	{
		_id: "qr_008",
		qrCode: "QR-AG-008",
		companyId: MOCK_COMPANY_ID,
		assetId: null,
		status: QRCodeStatus.RETIRED,
		allocatedAt: "2024-03-01T00:00:00Z",
		linkedAt: null,
		createdAt: "2024-01-01T00:00:00Z",
	},
];

export const qrCodeHandlers = [
	// Check QR code status
	http.get("/api/qr/:qrCode", async ({ params }) => {
		await delay(100);

		const { qrCode } = params;
		const qr = MOCK_QR_CODES.find((q) => q.qrCode === qrCode);

		if (!qr) {
			return HttpResponse.json({ success: false, error: "QR code not found" }, { status: 404 });
		}

		return HttpResponse.json({
			success: true,
			qrCode: qr.qrCode,
			status: qr.status,
			asset: qr.assetId
				? {
						_id: qr.assetId,
						serialNumber: `SN-${qr.assetId}`,
						make: "Sample Make",
						model: "Sample Model",
					}
				: null,
		});
	}),

	// Get company QR codes (customer portal)
	http.get("/api/qr-codes", async ({ request }) => {
		await delay(100);

		const url = new URL(request.url);
		const status = url.searchParams.get("status");
		const page = Number(url.searchParams.get("page")) || 1;
		const limit = Number(url.searchParams.get("limit")) || 20;

		// Filter by company (in real app, this comes from JWT)
		let qrCodes = MOCK_QR_CODES.filter((q) => q.companyId === MOCK_COMPANY_ID);

		if (status) {
			qrCodes = qrCodes.filter((q) => q.status === status);
		}

		const total = qrCodes.length;
		const startIndex = (page - 1) * limit;
		const paginatedData = qrCodes.slice(startIndex, startIndex + limit);

		return HttpResponse.json({
			qrCodes: paginatedData,
			pagination: {
				total,
				page,
				pages: Math.ceil(total / limit),
			},
		});
	}),

	// Allocate QR codes to company (admin only)
	http.post("/api/qr/allocate", async ({ request }) => {
		await delay(100);

		const body = (await request.json()) as { qrCodes: string[]; companyId: string };

		return HttpResponse.json({
			success: true,
			allocated: body.qrCodes.length,
		});
	}),

	// Bulk import QR codes (admin only)
	http.post("/api/qr/bulk-import", async () => {
		await delay(100);

		return HttpResponse.json({
			success: true,
			imported: 100,
			duplicates: 2,
			errors: [],
		});
	}),

	// Get all QR codes (admin only)
	http.get("/api/admin/qr-codes", async ({ request }) => {
		await delay(100);

		const url = new URL(request.url);
		const status = url.searchParams.get("status");
		const companyId = url.searchParams.get("companyId");
		const page = Number(url.searchParams.get("page")) || 1;
		const limit = Number(url.searchParams.get("limit")) || 20;

		let qrCodes = [...MOCK_QR_CODES];

		if (status) {
			qrCodes = qrCodes.filter((q) => q.status === status);
		}

		if (companyId) {
			qrCodes = qrCodes.filter((q) => q.companyId === companyId);
		}

		const total = qrCodes.length;
		const startIndex = (page - 1) * limit;
		const paginatedData = qrCodes.slice(startIndex, startIndex + limit);

		return HttpResponse.json({
			qrCodes: paginatedData,
			pagination: {
				total,
				page,
				pages: Math.ceil(total / limit),
			},
		});
	}),

	// Retire QR code (admin only)
	http.put("/api/admin/qr-codes/:qrCodeId/retire", async ({ params }) => {
		await delay(100);

		const { qrCodeId } = params;

		return HttpResponse.json({
			success: true,
			message: `QR code ${qrCodeId} retired successfully`,
		});
	}),
];
