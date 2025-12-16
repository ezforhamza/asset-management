import { http, HttpResponse, delay } from "msw";
import { MOCK_ASSETS } from "../data/assets";
import { MOCK_VERIFICATIONS } from "../data/verifications";

export const assetHandlers = [
	// Get all assets
	http.get("/api/assets", async ({ request }) => {
		await delay(100);

		const url = new URL(request.url);
		const status = url.searchParams.get("status");
		const page = Number(url.searchParams.get("page")) || 1;
		const limit = Number(url.searchParams.get("limit")) || 50;

		let assets = [...MOCK_ASSETS];

		if (status) {
			assets = assets.filter((a) => a.status === status);
		}

		// Pagination
		const total = assets.length;
		const startIndex = (page - 1) * limit;
		const paginatedAssets = assets.slice(startIndex, startIndex + limit);

		return HttpResponse.json({
			assets: paginatedAssets,
			pagination: {
				total,
				page,
				pages: Math.ceil(total / limit),
			},
		});
	}),

	// Get single asset
	http.get("/api/assets/:assetId", async ({ params }) => {
		await delay(100);

		const { assetId } = params;
		const asset = MOCK_ASSETS.find((a) => a._id === assetId);

		if (!asset) {
			return HttpResponse.json({ success: false, error: "Asset not found" }, { status: 404 });
		}

		return HttpResponse.json(asset);
	}),

	// Update asset
	http.put("/api/assets/:assetId", async ({ params }) => {
		await delay(100);

		const { assetId } = params;

		return HttpResponse.json({
			success: true,
			message: `Asset ${assetId} updated successfully`,
		});
	}),

	// Get verification history for asset
	http.get("/api/verifications/asset/:assetId", async ({ params }) => {
		await delay(100);

		const { assetId } = params;
		const verifications = MOCK_VERIFICATIONS.filter((v) => v.assetId === assetId);

		return HttpResponse.json(verifications);
	}),

	// Update investigation status
	http.put("/api/verifications/:verificationId/investigate", async () => {
		await delay(100);

		return HttpResponse.json({
			success: true,
			message: "Investigation status updated",
		});
	}),

	// Bulk import assets
	http.post("/api/assets/bulk-import", async ({ request }) => {
		await delay(200);

		const body = (await request.json()) as { assets: Array<{ serialNumber: string }> };
		const totalAssets = body.assets?.length || 0;

		// Simulate some failures for realism
		const failedCount = Math.floor(totalAssets * 0.1);
		const importedCount = totalAssets - failedCount;

		const errors = failedCount > 0 ? [{ row: 3, error: "Duplicate serial number" }] : [];

		return HttpResponse.json({
			success: true,
			imported: importedCount,
			failed: failedCount,
			errors,
		});
	}),

	// Transfer asset to another company
	http.post("/api/assets/transfer", async ({ request }) => {
		await delay(100);

		const body = (await request.json()) as { assetId: string; toCompanyId: string };

		return HttpResponse.json({
			success: true,
			message: `Asset ${body.assetId} transferred to company ${body.toCompanyId}`,
		});
	}),

	// Retire asset
	http.post("/api/assets/:assetId/retire", async ({ params }) => {
		await delay(100);

		const { assetId } = params;

		return HttpResponse.json({
			success: true,
			message: `Asset ${assetId} has been retired`,
		});
	}),
];
