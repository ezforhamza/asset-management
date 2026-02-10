import useUserStore from "@/store/userStore";
import apiClient from "../apiClient";
import type { PaginatedResponse } from "./userService";

// ============================================
// Company Types
// ============================================

export interface CompanySettings {
	verificationFrequency: number;
	geofenceThreshold: number;
	allowGPSOverride: boolean;
	imageRetentionDays: number;
	repairNotificationEmails: string[];
	dueSoonDays?: number;
}

export interface Company {
	id: string;
	companyName: string;
	contactEmail: string;
	phone?: string;
	address?: string;
	logo?: string;
	settings: CompanySettings;
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface CompanyWithStats extends Company {
	stats?: {
		totalUsers: number;
		totalAssets: number;
		totalQRCodes: number;
		totalVerifications: number;
	};
	users?: Array<{
		id: string;
		name: string;
		email: string;
		role: string;
		status: string;
	}>;
	assets?: Array<{
		id: string;
		serialNumber: string;
		make: string;
		model: string;
		status: string;
	}>;
}

export interface CreateCompanyReq {
	companyName: string;
	contactEmail: string;
	settings?: Partial<CompanySettings>;
	admin: {
		name: string;
		email: string;
		password: string;
	};
}

export interface CreateCompanyRes {
	company: Company;
	admin: {
		id: string;
		name: string;
		email: string;
		role: string;
		isDefaultAdmin: boolean;
	};
}

export interface UpdateCompanyReq {
	companyName?: string;
	contactEmail?: string;
	phone?: string;
	address?: string;
	settings?: Partial<CompanySettings>;
	isActive?: boolean;
}

// Profile update request (subset of company fields)
export interface UpdateProfileReq {
	companyName?: string;
	contactEmail?: string;
	phone?: string;
	address?: string;
	logo?: string;
}

// Settings update request
export interface UpdateSettingsReq {
	geofenceThreshold?: number;
	allowGPSOverride?: boolean;
	dueSoonDays?: number;
	repairNotificationEmails?: string[];
}

// Verification frequency update request (via company settings)
export interface UpdateCompanySettingsReq {
	verificationFrequency?: number;
}

// Asset Template Types
export interface AssetTemplate {
	_id: string;
	name: string;
	description: string;
	verificationFrequency: number;
	checklistItems: string[];
	assetCount: number;
	companyId: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateAssetTemplateReq {
	name: string;
	description?: string;
	verificationFrequency: number;
	checklistItems: string[];
}

export interface GetCompaniesParams {
	companyName?: string;
	isActive?: boolean;
	sortBy?: string;
	limit?: number;
	page?: number;
}

export interface CompaniesListRes extends PaginatedResponse<Company> {}

// ============================================
// API Endpoints
// ============================================

enum CompanyApi {
	Companies = "/companies",
}

// ============================================
// Company Service (System Admin)
// ============================================

const getCompanies = (params?: GetCompaniesParams) =>
	apiClient.get<CompaniesListRes>({ url: CompanyApi.Companies, params });

const getCompanyById = (companyId: string) =>
	apiClient.get<CompanyWithStats>({ url: `${CompanyApi.Companies}/${companyId}` });

const createCompany = (data: CreateCompanyReq) => apiClient.post<CreateCompanyRes>({ url: CompanyApi.Companies, data });

const updateCompany = (companyId: string, data: UpdateCompanyReq) =>
	apiClient.patch<Company>({ url: `${CompanyApi.Companies}/${companyId}`, data });

const deleteCompany = (companyId: string) => apiClient.delete<void>({ url: `${CompanyApi.Companies}/${companyId}` });

const getCompanySettings = (companyId: string) =>
	apiClient.get<CompanySettings>({ url: `${CompanyApi.Companies}/${companyId}/settings` });

// ============================================
// Customer Admin Service (for current user's company)
// ============================================

// Helper to get current user's company ID
const getCurrentCompanyId = (): string => {
	const { userInfo } = useUserStore.getState();
	if (!userInfo.companyId) {
		throw new Error("No company ID found for current user");
	}
	return userInfo.companyId;
};

// Get company profile for current user's company
const getProfile = () => {
	const companyId = getCurrentCompanyId();
	return apiClient.get<Company>({ url: `${CompanyApi.Companies}/${companyId}` });
};

// Update company profile
const updateProfile = (data: UpdateProfileReq) => {
	const companyId = getCurrentCompanyId();
	return apiClient.patch<Company>({ url: `${CompanyApi.Companies}/${companyId}`, data });
};

// Get company settings for current user's company
const getSettings = () => {
	const companyId = getCurrentCompanyId();
	return apiClient.get<Company>({ url: `${CompanyApi.Companies}/${companyId}` }).then((company) => company.settings);
};

// Update company settings
const updateSettings = (settings: UpdateSettingsReq) => {
	const companyId = getCurrentCompanyId();
	return apiClient.patch<Company>({ url: `${CompanyApi.Companies}/${companyId}`, data: { settings } });
};

// Update company settings (verificationFrequency via settings payload)
const updateCompanySettings = (data: UpdateCompanySettingsReq) => {
	const companyId = getCurrentCompanyId();
	return apiClient.patch<Company>({ url: `${CompanyApi.Companies}/${companyId}`, data: { settings: data } });
};

// ============================================
// Asset Templates Service
// ============================================

const getAssetTemplates = () => {
	const companyId = getCurrentCompanyId();
	return apiClient.get<AssetTemplate[]>({ url: `${CompanyApi.Companies}/${companyId}/templates` });
};

const createAssetTemplate = (data: CreateAssetTemplateReq) => {
	const companyId = getCurrentCompanyId();
	return apiClient.post<AssetTemplate>({ url: `${CompanyApi.Companies}/${companyId}/templates`, data });
};

const deleteAssetTemplate = (templateId: string) => {
	const companyId = getCurrentCompanyId();
	return apiClient.delete<void>({ url: `${CompanyApi.Companies}/${companyId}/templates/${templateId}` });
};

export default {
	// System Admin APIs
	getCompanies,
	getCompanyById,
	createCompany,
	updateCompany,
	deleteCompany,
	getCompanySettings,
	// Customer Admin APIs (for current user's company)
	getProfile,
	updateProfile,
	getSettings,
	updateSettings,
	updateCompanySettings,
	// Asset Templates
	getAssetTemplates,
	createAssetTemplate,
	deleteAssetTemplate,
};
