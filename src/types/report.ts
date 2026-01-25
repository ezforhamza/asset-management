import type { PaginatedResponse } from "./admin";

// ============================================
// Verification Report Types
// ============================================

export interface VerificationReportItem {
	_id: string;
	assetId: string;
	serialNumber: string;
	make: string;
	model: string;
	makeModel: string;
	verificationStatus: "on_time" | "due_soon" | "overdue";
	nextVerificationDue: string;
	daysUntilDue: number;
	totalVerifications: number;
	registeredLocation?: {
		type: string;
		coordinates: [number, number];
	};
	lastVerifiedAt?: string;
	lastGpsCheckPassed?: boolean;
	lastCondition?: "excellent" | "good" | "fair" | "poor";
	lastOperational?: "operational" | "needs_repair" | "non_operational";
	verifiedBy?: {
		_id: string;
		name: string;
		email: string;
	};
	assetCategory?: {
		_id: string;
		name: string;
		code: string;
	};
}

export interface VerificationReportParams {
	startDate?: string;
	endDate?: string;
	status?: "on_time" | "due_soon" | "overdue";
	assetId?: string;
	verifiedBy?: string;
	gpsCheckPassed?: boolean;
	condition?: "excellent" | "good" | "fair" | "poor";
	operationalStatus?: "operational" | "needs_repair" | "non_operational";
	categoryId?: string;
	limit?: number;
	page?: number;
}

export interface FleetSummary {
	totalVerifiedAssets: number;
	condition: {
		good: number;
		fair: number;
		poor: number;
	};
	operationalStatus: {
		operational: number;
		needsRepair: number;
		nonOperational: number;
	};
}

export interface VerificationReportRes extends PaginatedResponse<VerificationReportItem> {
	fleetSummary?: FleetSummary;
}

// ============================================
// Overdue Assets Report Types
// ============================================

export interface OverdueAssetItem {
	assetId: string;
	serialNumber: string;
	make: string;
	model: string;
	daysOverdue: number;
	lastVerifiedAt: string;
	nextVerificationDue: string;
}

export interface OverdueAssetsParams {
	minDaysOverdue?: number;
	limit?: number;
	page?: number;
}

export interface OverdueAssetsRes extends PaginatedResponse<OverdueAssetItem> {}

// ============================================
// Map Assets Types
// ============================================

export interface MapAssetItem {
	assetId: string;
	serialNumber: string;
	make: string;
	model: string;
	location: {
		longitude: number;
		latitude: number;
	};
	status: "on_time" | "due_soon" | "overdue";
	lastVerified: string;
	nextDue: string;
}

export interface MapAssetsParams {
	status?: "on_time" | "due_soon" | "overdue";
}

export interface MapAssetsRes {
	success: boolean;
	assets: MapAssetItem[];
	total: number;
}

// ============================================
// Dashboard Stats Types
// ============================================

export interface DashboardStatsParams {
	startDate?: string;
	endDate?: string;
}

export interface DashboardStatsRes {
	success: boolean;
	stats: {
		assets: {
			byStatus: {
				active: number;
				retired: number;
				transferred: number;
			};
			total: number;
		};
		verificationStatus: {
			onTime: number;
			dueSoon: number;
			overdue: number;
		};
		activity: {
			totalVerifications: number;
			gpsOverrides: number;
			repairsNeeded: number;
			openInvestigations: number;
		};
	};
}

// ============================================
// Export Report Types
// ============================================

export interface ExportReportParams {
	format: "csv" | "pdf";
	reportType: "verifications" | "overdue" | "assets";
	startDate?: string;
	endDate?: string;
	status?: "on_time" | "due_soon" | "overdue";
}
