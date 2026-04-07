import useUserStore from "@/store/userStore";
import apiClient from "../apiClient";

// ============================================
// Site Name Types
// ============================================

export interface SiteName {
	id: string;
	name: string;
	companyId: string;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

export interface SiteNamesListRes {
	results: SiteName[];
	page: number;
	limit: number;
	totalPages: number;
	totalResults: number;
}

export interface CreateSiteNameReq {
	name: string;
}

export interface UpdateSiteNameReq {
	name: string;
}

export interface BulkImportSiteNameRes {
	success: boolean;
	imported: number;
	duplicates?: number;
	duplicatesList?: string[];
	errors: string[];
	totalProcessed: number;
	failedCount?: number;
	failedFile?: string;
}

// ============================================
// API Endpoints
// ============================================

enum SiteNameApi {
	SiteNames = "/site-names",
}

// ============================================
// Site Name Service
// ============================================

const getSiteNames = (params?: { page?: number; limit?: number; sortBy?: string; name?: string }) =>
	apiClient.get<SiteNamesListRes>({ url: SiteNameApi.SiteNames, params });

const getSiteNameById = (siteNameId: string) =>
	apiClient.get<SiteName>({ url: `${SiteNameApi.SiteNames}/${siteNameId}` });

const createSiteName = (data: CreateSiteNameReq) =>
	apiClient.post<{ siteName: SiteName; message: string }>({ url: SiteNameApi.SiteNames, data });

const updateSiteName = (siteNameId: string, data: UpdateSiteNameReq) =>
	apiClient.patch<SiteName>({ url: `${SiteNameApi.SiteNames}/${siteNameId}`, data });

const deleteSiteName = (siteNameId: string) =>
	apiClient.delete<{ success: boolean; message: string }>({ url: `${SiteNameApi.SiteNames}/${siteNameId}` });

const bulkImportSiteNames = (file: File) => {
	const formData = new FormData();
	formData.append("file", file);
	return apiClient.post<BulkImportSiteNameRes>({
		url: `${SiteNameApi.SiteNames}/bulk-import`,
		data: formData,
		headers: { "Content-Type": "multipart/form-data" },
	});
};

const downloadImportTemplate = () => {
	const { userToken } = useUserStore.getState();
	const baseUrl = import.meta.env.VITE_APP_API_BASE_URL || "/api/v1";
	const token = userToken?.accessToken;

	return fetch(`${baseUrl}${SiteNameApi.SiteNames}/import-template`, {
		headers: { Authorization: `Bearer ${token}` },
	})
		.then((response) => {
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
			return response.blob();
		})
		.then((blob) => {
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "sitename-import-template.xlsx";
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		});
};

export default {
	getSiteNames,
	getSiteNameById,
	createSiteName,
	updateSiteName,
	deleteSiteName,
	bulkImportSiteNames,
	downloadImportTemplate,
};
