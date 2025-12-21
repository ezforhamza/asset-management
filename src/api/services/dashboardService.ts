import apiClient from "../apiClient";
import API_ENDPOINTS from "../endpoints";

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
	totalCompanies: number;
	totalUsers: number;
	totalAssets: number;
	totalQRCodes: number;
}

export interface RecentCompany {
	_id: string;
	companyName: string;
	contactEmail: string;
	createdAt: string;
	totalUsers: number;
}

export interface DashboardResponse {
	success: boolean;
	stats: DashboardStats;
	recentCompanies: RecentCompany[];
}

// ============================================
// Dashboard Service
// ============================================

const getDashboardData = () => apiClient.get<DashboardResponse>({ url: API_ENDPOINTS.DASHBOARD });

export default {
	getDashboardData,
};
