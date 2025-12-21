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
}

export interface Company {
	id: string;
	companyName: string;
	contactEmail: string;
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
	settings?: Partial<CompanySettings>;
	isActive?: boolean;
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

const createCompany = (data: CreateCompanyReq) =>
	apiClient.post<CreateCompanyRes>({ url: CompanyApi.Companies, data });

const updateCompany = (companyId: string, data: UpdateCompanyReq) =>
	apiClient.patch<Company>({ url: `${CompanyApi.Companies}/${companyId}`, data });

const deleteCompany = (companyId: string) =>
	apiClient.delete<void>({ url: `${CompanyApi.Companies}/${companyId}` });

const getCompanySettings = (companyId: string) =>
	apiClient.get<CompanySettings>({ url: `${CompanyApi.Companies}/${companyId}/settings` });

export default {
	getCompanies,
	getCompanyById,
	createCompany,
	updateCompany,
	deleteCompany,
	getCompanySettings,
};
