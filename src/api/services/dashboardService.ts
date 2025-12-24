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

// User Dashboard Types
export interface UserDashboardStats {
	assets: {
		byStatus: {
			active: number;
			retired: number;
			transferred: number;
		};
		total: number;
	};
	verificationStatus: {
		onTime: number;
		dueSoon: number;
		overdue: number;
	};
	activity: {
		totalVerifications: number;
		gpsOverrides: number;
		repairsNeeded: number;
		openInvestigations: number;
	};
}

export interface UserDashboardResponse {
	success: boolean;
	stats: UserDashboardStats;
}

// ============================================
// Dashboard Service
// ============================================

const getDashboardData = () => apiClient.get<DashboardResponse>({ url: API_ENDPOINTS.DASHBOARD });

const getStats = () => apiClient.get<UserDashboardResponse>({ url: API_ENDPOINTS.REPORTS.DASHBOARD });

const getRecentActivity = (limit: number = 10) =>
	apiClient.get({ url: `${API_ENDPOINTS.VERIFICATIONS.BASE}?limit=${limit}` });

export default {
	getDashboardData,
	getStats,
	getRecentActivity,
};
