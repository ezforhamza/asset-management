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

export default {
	getSiteNames,
	getSiteNameById,
	createSiteName,
	updateSiteName,
	deleteSiteName,
};
