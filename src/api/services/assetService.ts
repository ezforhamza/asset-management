import type { Asset, Verification } from "#/entity";
import useUserStore from "@/store/userStore";
import apiClient from "../apiClient";

// ============================================
// Asset Types
// ============================================

export interface AssetsListParams {
	companyId?: string;
	serialNumber?: string;
	make?: string;
	model?: string;
	status?: string;
	verificationStatus?: string;
	categoryId?: string;
	client?: string;
	siteName?: string;
	channel?: string;
	sortBy?: string;
	page?: number;
	limit?: number;
}

export interface AssetsListRes {
	results: Asset[];
	page: number;
	limit: number;
	totalPages: number;
	totalResults: number;
}

export interface UpdateAssetReq {
	serialNumber?: string;
	make?: string;
	model?: string;
	status?: string;
	verificationFrequency?: number;
	geofenceThreshold?: number | null;
	client?: string;
	channel?: string;
	siteName?: string;
	siteNameId?: string;
	categoryId?: string;
}

export interface ExportAssetsParams {
	format: "csv" | "pdf";
	status?: "active" | "retired" | "transferred";
	registrationState?: boolean;
	categoryId?: string;
}

export interface CreateAssetReq {
	serialNumber: string;
	make: string;
	model: string;
	category: string;
	condition?: string;
	verificationFrequency?: number;
	locationDescription?: string;
	notes?: string;
	channel?: string;
	siteName?: string;
	siteNameId?: string;
	client?: string;
	geofenceThreshold?: number;
}

export interface BulkImportAssetRes {
	success: boolean;
	imported: number;
	duplicates?: number;
	duplicatesList?: string[];
	errors: string[];
	totalProcessed: number;
}

export interface TransferAssetReq {
	assetId: string;
	toCompanyId: string;
	reason?: string;
}

export interface TransferAssetRes {
	success: boolean;
	message: string;
}

// ============================================
// Verification Types
// ============================================

export interface VerificationHistoryRes {
	verifications: Verification[];
}

export interface InvestigateReq {
	investigationStatus: "open" | "investigating" | "resolved";
	comment?: string;
}

// ============================================
// Asset History Types
// ============================================

export interface HistoryPerformedBy {
	id: string;
	name: string;
	email: string;
	role: "field_user" | "customer_admin" | "system_admin";
}

export interface RegistrationHistoryItem {
	id: string;
	action: "registered";
	timestamp: string;
	performedBy: HistoryPerformedBy;
	photos: string[];
	location?: {
		latitude: number;
		longitude: number;
		mapLink?: string;
	};
	locationAccuracy?: number;
	conditionAtRegistration?: string;
	category?: {
		id: string;
		name: string;
	};
	qrCode?: {
		code: string;
		status: string;
		linkedAt?: string;
	};
	notes?: string;
}

export interface VerificationHistoryItem {
	id: string;
	verifiedBy?: HistoryPerformedBy;
	verifiedAt: string;
	photos: string[];
	gpsCheckPassed: boolean;
	distance?: number;
	geofenceThreshold?: number;
	verificationStatus?: "verified" | "failed" | "pending";
	verifiedAtLocation?: {
		latitude: number;
		longitude: number;
		mapLink?: string;
	};
	locationAccuracy?: number;
	assetCondition?: "good" | "fair" | "poor" | "damaged";
	operationalStatus?: "operational" | "non_operational" | "needs_repair";
	repairNeeded: boolean;
	checklist?: {
		conditionExplanation?: string;
	};
	nextVerificationDue?: string;
	daysUntilNextVerification?: number;
	notes?: string;
}

export interface AssetHistoryRes {
	asset: Asset;
	registrationHistory: RegistrationHistoryItem[];
	verificationHistory: VerificationHistoryItem[];
}

// ============================================
// API Endpoints
// ============================================

enum AssetApi {
	Assets = "/assets",
}

enum VerificationApi {
	Verifications = "/verifications",
}

// ============================================
// Asset Service
// ============================================

const getAssets = (params?: AssetsListParams) => apiClient.get<AssetsListRes>({ url: AssetApi.Assets, params });

const getAssetById = (assetId: string) => apiClient.get<Asset>({ url: `${AssetApi.Assets}/${assetId}` });

const updateAsset = (assetId: string, data: UpdateAssetReq) =>
	apiClient.patch<{ success: boolean; message: string }>({ url: `${AssetApi.Assets}/${assetId}`, data });

const createAsset = (data: CreateAssetReq) => apiClient.post<Asset>({ url: `${AssetApi.Assets}/create`, data });

const bulkImportAssets = (file: File) => {
	const formData = new FormData();
	formData.append("file", file);
	return apiClient.post<BulkImportAssetRes>({
		url: `${AssetApi.Assets}/bulk-import`,
		data: formData,
		headers: { "Content-Type": "multipart/form-data" },
	});
};

const transferAsset = (data: TransferAssetReq) =>
	apiClient.post<TransferAssetRes>({ url: `${AssetApi.Assets}/transfer`, data });

const retireAsset = (assetId: string, reason?: string) =>
	apiClient.post<{ success: boolean; message: string }>({
		url: `${AssetApi.Assets}/${assetId}/retire`,
		data: { reason },
	});

const deleteAsset = (assetId: string) =>
	apiClient.delete<{ success: boolean; message: string }>({ url: `${AssetApi.Assets}/${assetId}` });

const detachQrCode = (assetId: string) =>
	apiClient.patch<{ message: string; assetId: string; previousQrCode: string }>({
		url: `${AssetApi.Assets}/${assetId}/detach-qr`,
	});

// ============================================
// Verification Service
// ============================================

const getVerificationHistory = (assetId: string) =>
	apiClient.get<Verification[]>({ url: `${VerificationApi.Verifications}/asset/${assetId}` });

const updateInvestigation = (verificationId: string, data: InvestigateReq) =>
	apiClient.put<{ success: boolean; message: string }>({
		url: `${VerificationApi.Verifications}/${verificationId}/investigate`,
		data,
	});

// ============================================
// Asset History Service
// ============================================

const getAssetHistory = (assetId: string) =>
	apiClient.get<AssetHistoryRes>({ url: `${AssetApi.Assets}/${assetId}/history` });

// ============================================
// Asset Export Service
// ============================================

const exportAssets = (params: ExportAssetsParams) => {
	const queryParams = new URLSearchParams();
	queryParams.append("format", params.format);
	if (params.status) queryParams.append("status", params.status);
	if (params.registrationState !== undefined) queryParams.append("registrationState", String(params.registrationState));
	if (params.categoryId) queryParams.append("categoryId", params.categoryId);

	const { userToken } = useUserStore.getState();
	const baseUrl = import.meta.env.VITE_APP_API_BASE_URL || "/api/v1";
	const token = userToken?.accessToken;

	return fetch(`${baseUrl}${AssetApi.Assets}/export?${queryParams.toString()}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.blob();
		})
		.then((blob) => {
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `assets_export_${new Date().toISOString().split("T")[0]}.${params.format}`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		});
};

export default {
	// Assets
	getAssets,
	getAssetById,
	createAsset,
	updateAsset,
	deleteAsset,
	detachQrCode,
	bulkImportAssets,
	transferAsset,
	retireAsset,
	exportAssets,
	// Verifications
	getVerificationHistory,
	updateInvestigation,
	// Asset History
	getAssetHistory,
};
