import apiClient from "../apiClient";

import type { Asset, Verification } from "#/entity";

// ============================================
// Asset Types
// ============================================

export interface AssetsListParams {
	status?: string;
	page?: number;
	limit?: number;
}

export interface AssetsListRes {
	assets: Asset[];
	pagination: {
		total: number;
		page: number;
		pages: number;
	};
}

export interface UpdateAssetReq {
	make?: string;
	model?: string;
	verificationFrequency?: number;
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
	apiClient.put<{ success: boolean; message: string }>({ url: `${AssetApi.Assets}/${assetId}`, data });

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
	updateAsset,
	// Verifications
	getVerificationHistory,
	updateInvestigation,
};
