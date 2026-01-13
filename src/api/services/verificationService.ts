import apiClient from "../apiClient";
import { API_ENDPOINTS } from "../endpoints";

// ============================================
// Verification Types
// ============================================

export interface ScanLocation {
	type: "Point";
	coordinates: [number, number];
}

export interface VerificationChecklist {
	repairNotes: string;
	explanation: string;
	conditionExplanation: string;
	conditionStatus: "good" | "fair" | "poor" | "unknown";
	operationalStatus: "operational" | "non_operational" | "unknown";
}

export interface VerificationAsset {
	registeredLocation: ScanLocation;
	qrCodeId: string;
	serialNumber: string;
	make: string;
	model: string;
	locationAccuracy: number;
	registeredBy: string;
	registeredAt: string;
	status: string;
	registrationState: string;
	verificationFrequency: number | null;
	geofenceThreshold: number | null;
	lastVerifiedAt: string | null;
	nextVerificationDue: string | null;
	photos: string[];
	locationDescription: string | null;
	notes: string | null;
	condition: string;
	allocatedTo: string | null;
	channel: string | null;
	siteName: string | null;
	client: string | null;
	companyId: string;
	categoryId: string;
	id: string;
}

export interface VerificationUser {
	fieldWorkerSettings?: {
		allowGPSOverride: boolean;
		gpsOverrideCount: number;
		gpsOverrideCountResetDate: string;
		gpsOverrideRestricted: boolean;
		lastGpsOverrideAt: string | null;
		totalGpsOverrides: number;
	};
	role: string;
	isEmailVerified: boolean;
	status: string;
	mustChangePassword: boolean;
	devicePlatform: string | null;
	mfaEnabled: boolean;
	profilePic: string | null;
	isDefaultAdmin: boolean;
	adminType: string | null;
	name: string;
	email: string;
	companyId: string;
	id: string;
}

export type VerificationResult =
	| "passed"
	| "passed_with_flags"
	| "failed"
	| "pending_admin_review"
	| "investigation_required";

export type InvestigationStatus = "open" | "resolved" | "dismissed" | null;

export interface Verification {
	scanLocation: ScanLocation;
	checklist: VerificationChecklist;
	scanLocationAccuracy: number;
	gpsAccuracyPassed: boolean;
	gpsRetryCount: number;
	gpsOverrideUsed: boolean;
	verificationResult: VerificationResult;
	flags: string[];
	isOfflineSubmission: boolean;
	photos: string[];
	repairNeeded: boolean;
	repairEmailSent: boolean;
	investigationStatus: InvestigationStatus;
	syncedFromDevice: string | null;
	originalTimestamp: string | null;
	geofenceThresholdUsed: number;
	canRetryAfterGeofenceAdjust: boolean;
	assetId: VerificationAsset | null;
	companyId: string;
	verifiedBy: VerificationUser;
	verifiedAt: string;
	distanceFromAsset: number;
	gpsCheckPassed: boolean;
	investigationComments: string[];
	id: string;
}

export interface VerificationsParams {
	userId?: string;
	assetId?: string;
	page?: number;
	limit?: number;
	sortBy?: string;
}

export interface VerificationsRes {
	success: boolean;
	results: Verification[];
	page: number;
	limit: number;
	totalPages: number;
	totalResults: number;
}

// ============================================
// Verification Service
// ============================================

const getVerifications = (params?: VerificationsParams) =>
	apiClient.get<VerificationsRes>({ url: API_ENDPOINTS.VERIFICATIONS.BASE, params });

const getVerificationById = (id: string) => apiClient.get<Verification>({ url: API_ENDPOINTS.VERIFICATIONS.BY_ID(id) });

const getVerificationsByAsset = (assetId: string) =>
	apiClient.get<VerificationsRes>({ url: API_ENDPOINTS.VERIFICATIONS.BY_ASSET(assetId) });

const getVerificationsByUser = (userId: string, params?: Omit<VerificationsParams, "userId">) =>
	apiClient.get<VerificationsRes>({ url: API_ENDPOINTS.VERIFICATIONS.BASE, params: { ...params, userId } });

export default {
	getVerifications,
	getVerificationById,
	getVerificationsByAsset,
	getVerificationsByUser,
};
