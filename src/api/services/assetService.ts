import type { Asset, Verification } from "#/entity";
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

export default {
	// Assets
	getAssets,
	getAssetById,
	createAsset,
	updateAsset,
	deleteAsset,
	bulkImportAssets,
	transferAsset,
	retireAsset,
	// Verifications
	getVerificationHistory,
	updateInvestigation,
};
