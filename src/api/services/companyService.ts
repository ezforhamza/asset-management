import apiClient from "../apiClient";

// ============================================
// Company Types (for Customer Portal)
// ============================================

export interface CompanySettings {
	verificationFrequency: number;
	geofenceThreshold: number;
	allowGPSOverride: boolean;
	imageRetentionDays: number;
	repairNotificationEmails: string[];
	dueSoonDays: number;
}

export interface CompanyProfile {
	_id: string;
	companyName: string;
	contactEmail: string;
	phone?: string;
	address?: string;
	settings: CompanySettings;
	isActive: boolean;
	createdAt: string;
}

export interface UpdateCompanyProfileReq {
	companyName?: string;
	contactEmail?: string;
	phone?: string;
	address?: string;
}

export interface UpdateCompanySettingsReq {
	verificationFrequency?: number;
	geofenceThreshold?: number;
	allowGPSOverride?: boolean;
	imageRetentionDays?: number;
	repairNotificationEmails?: string[];
	dueSoonDays?: number;
}

// ============================================
// Asset Template Types
// ============================================

export interface AssetTemplate {
	_id: string;
	name: string;
	description: string;
	verificationFrequency: number;
	checklistItems: string[];
	assetCount: number;
}

export interface CreateAssetTemplateReq {
	name: string;
	description: string;
	verificationFrequency: number;
	checklistItems: string[];
}

// ============================================
// API Endpoints
// ============================================

enum CompanyApi {
	Profile = "/company/profile",
	Settings = "/company/settings",
	Templates = "/company/asset-templates",
}

// ============================================
// Company Service (Customer Portal)
// ============================================

const getProfile = () => apiClient.get<CompanyProfile>({ url: CompanyApi.Profile });

const updateProfile = (data: UpdateCompanyProfileReq) =>
	apiClient.put<{ success: boolean; message: string }>({ url: CompanyApi.Profile, data });

const getSettings = () => apiClient.get<CompanySettings>({ url: CompanyApi.Settings });

const updateSettings = (data: UpdateCompanySettingsReq) =>
	apiClient.put<{ success: boolean; message: string }>({ url: CompanyApi.Settings, data });

// ============================================
// Asset Template Service
// ============================================

const getAssetTemplates = () => apiClient.get<AssetTemplate[]>({ url: CompanyApi.Templates });

const createAssetTemplate = (data: CreateAssetTemplateReq) =>
	apiClient.post<{ success: boolean; templateId: string }>({ url: CompanyApi.Templates, data });

const deleteAssetTemplate = (templateId: string) =>
	apiClient.delete<{ success: boolean }>({ url: `${CompanyApi.Templates}/${templateId}` });

export default {
	getProfile,
	updateProfile,
	getSettings,
	updateSettings,
	getAssetTemplates,
	createAssetTemplate,
	deleteAssetTemplate,
};
