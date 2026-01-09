import apiClient from "../apiClient";

// ============================================
// Asset Category Types
// ============================================

export interface AssetCategory {
	id: string;
	name: string;
	status: "active" | "inactive";
	companyId: string;
	assetCount: number;
	createdBy?: {
		id: string;
		name: string;
		email: string;
		role: string;
	};
}

export interface AssetCategoriesListRes {
	results: AssetCategory[];
	page: number;
	limit: number;
	totalPages: number;
	totalResults: number;
}

export interface CreateAssetCategoryReq {
	name: string;
	status: "active" | "inactive";
}

export interface UpdateAssetCategoryReq {
	name?: string;
	status?: "active" | "inactive";
}

// ============================================
// API Endpoints
// ============================================

enum AssetCategoryApi {
	Categories = "/asset-categories",
}

// ============================================
// Asset Category Service
// ============================================

const getCategories = (params?: { page?: number; limit?: number }) =>
	apiClient.get<AssetCategoriesListRes>({ url: AssetCategoryApi.Categories, params });

const createCategory = (data: CreateAssetCategoryReq) =>
	apiClient.post<AssetCategory>({ url: AssetCategoryApi.Categories, data });

const updateCategory = (categoryId: string, data: UpdateAssetCategoryReq) =>
	apiClient.patch<AssetCategory>({ url: `${AssetCategoryApi.Categories}/${categoryId}`, data });

const deleteCategory = (categoryId: string) =>
	apiClient.delete<{ success: boolean; message: string }>({ url: `${AssetCategoryApi.Categories}/${categoryId}` });

export default {
	getCategories,
	createCategory,
	updateCategory,
	deleteCategory,
};
