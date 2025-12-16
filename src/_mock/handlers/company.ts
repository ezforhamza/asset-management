import { http, HttpResponse, delay } from "msw";
import { MOCK_COMPANY_ID } from "../data/users";

// Mock company data
const MOCK_COMPANY = {
	_id: MOCK_COMPANY_ID,
	companyName: "Asset Guard Industries",
	contactEmail: "admin@assetguard.com",
	phone: "+92 300 1234567",
	address: "123 Business Park, Karachi, Pakistan",
	settings: {
		verificationFrequency: 30,
		geofenceThreshold: 20,
		allowGPSOverride: true,
		imageRetentionDays: 365,
		repairNotificationEmails: ["admin@assetguard.com", "manager@assetguard.com"],
		dueSoonDays: 7,
	},
	isActive: true,
	createdAt: "2024-01-01T00:00:00Z",
};

export const companyHandlers = [
	// Get company profile
	http.get("/api/company/profile", async () => {
		await delay(100);
		return HttpResponse.json(MOCK_COMPANY);
	}),

	// Update company profile
	http.put("/api/company/profile", async ({ request }) => {
		await delay(100);

		const body = (await request.json()) as Record<string, unknown>;

		// Update mock data (in real app this would persist)
		Object.assign(MOCK_COMPANY, body);

		return HttpResponse.json({
			success: true,
			message: "Company profile updated successfully",
		});
	}),

	// Get company settings
	http.get("/api/company/settings", async () => {
		await delay(100);
		return HttpResponse.json(MOCK_COMPANY.settings);
	}),

	// Update company settings
	http.put("/api/company/settings", async ({ request }) => {
		await delay(100);

		const body = (await request.json()) as Record<string, unknown>;

		// Update mock settings
		Object.assign(MOCK_COMPANY.settings, body);

		return HttpResponse.json({
			success: true,
			message: "Company settings updated successfully",
		});
	}),

	// ============================================
	// Asset Templates
	// ============================================

	// Get asset templates
	http.get("/api/company/asset-templates", async () => {
		await delay(100);

		return HttpResponse.json([
			{
				_id: "template_1",
				name: "Heavy Excavator",
				description: "Large excavators used for construction sites",
				verificationFrequency: 14,
				checklistItems: [
					"Check hydraulic fluid level",
					"Inspect bucket teeth",
					"Test emergency stop",
					"Check track tension",
					"Verify all lights working",
				],
				assetCount: 12,
			},
			{
				_id: "template_2",
				name: "Backhoe Loader",
				description: "Versatile equipment for digging and loading",
				verificationFrequency: 7,
				checklistItems: ["Check oil level", "Inspect tires/wheels", "Test brakes", "Check loader bucket"],
				assetCount: 8,
			},
			{
				_id: "template_3",
				name: "Generator",
				description: "Portable power generators",
				verificationFrequency: 30,
				checklistItems: [
					"Check fuel level",
					"Inspect cables and connections",
					"Test start/stop",
					"Check output voltage",
				],
				assetCount: 25,
			},
		]);
	}),

	// Create asset template
	http.post("/api/company/asset-templates", async () => {
		await delay(100);

		return HttpResponse.json({
			success: true,
			templateId: `template_${Date.now()}`,
		});
	}),

	// Delete asset template
	http.delete("/api/company/asset-templates/:templateId", async () => {
		await delay(100);

		return HttpResponse.json({ success: true });
	}),
];
