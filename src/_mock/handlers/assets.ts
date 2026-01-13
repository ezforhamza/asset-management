import { delay, HttpResponse, http } from "msw";
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

	// Get asset history (registration + verification history)
	http.get("/api/assets/:assetId/history", async ({ params }) => {
		await delay(150);

		const { assetId } = params;
		const asset = MOCK_ASSETS.find((a) => a._id === assetId || a.id === assetId);

		if (!asset) {
			return HttpResponse.json({ success: false, error: "Asset not found" }, { status: 404 });
		}

		const verifications = MOCK_VERIFICATIONS.filter((v) => v.assetId === assetId);

		return HttpResponse.json({
			asset: {
				...asset,
				id: asset._id || asset.id,
			},
			registrationHistory: [
				{
					action: "registered",
					performedBy: {
						id: "user-field-1",
						name: "John Field Worker",
						email: "john.field@example.com",
						role: "field_user",
					},
					performedAt: asset.registeredAt || new Date().toISOString(),
					details: {
						location: asset.registeredLocation
							? {
									latitude:
										"coordinates" in asset.registeredLocation
											? asset.registeredLocation.coordinates[1]
											: asset.registeredLocation.latitude,
									longitude:
										"coordinates" in asset.registeredLocation
											? asset.registeredLocation.coordinates[0]
											: asset.registeredLocation.longitude,
								}
							: undefined,
						photos: asset.photos || [],
						notes: asset.notes || undefined,
					},
				},
			],
			verificationHistory: verifications.map((v, index) => ({
				id: v._id,
				verifiedBy: {
					id: v.verifiedBy,
					name: v.verifiedByName || "Field Worker",
					email: "fieldworker@example.com",
					role: "field_user",
				},
				verifiedAt: v.verifiedAt,
				gpsCheckPassed: v.gpsCheckPassed,
				distanceFromAsset: v.distanceFromAsset,
				scanLocation: v.scanLocation,
				checklist: v.checklist,
				repairNeeded: v.repairNeeded,
				photos: v.photos || [],
				notes: index === 0 ? "Routine verification completed. Asset in good condition." : undefined,
			})),
		});
	}),

	// Get asset photos
	http.get("/api/assets/:assetId/photos", async ({ params }) => {
		await delay(100);

		const { assetId } = params;
		const asset = MOCK_ASSETS.find((a) => a._id === assetId || a.id === assetId);

		if (!asset) {
			return HttpResponse.json({ success: false, error: "Asset not found" }, { status: 404 });
		}

		const verifications = MOCK_VERIFICATIONS.filter((v) => v.assetId === assetId);

		const photos = [
			...(asset.photos || []).map((url, i) => ({
				id: `reg-photo-${i}`,
				url,
				type: "registration" as const,
				uploadedAt: asset.registeredAt || new Date().toISOString(),
			})),
			...verifications.flatMap((v) =>
				(v.photos || []).map((url, i) => ({
					id: `ver-${v._id}-photo-${i}`,
					url,
					type: "verification" as const,
					verificationId: v._id,
					uploadedAt: v.verifiedAt,
				})),
			),
		];

		return HttpResponse.json({
			assetId,
			photos,
		});
	}),
];
