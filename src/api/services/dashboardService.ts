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
		registered: number;
		unregistered: number;
	};
	activity: {
		totalVerifications: number;
		gpsOverrides: number;
		repairsNeeded: number;
		openInvestigations: number;
	};
}

// Recent Activity Types
export interface RecentActivityItem {
	_id: string;
	activityType: "registration" | "verification";
	timestamp: string;
	asset: {
		_id: string;
		serialNumber: string;
		make: string;
		model: string;
	};
	performedBy: {
		_id: string;
		name: string;
		email: string;
	};
	details: {
		// Registration details
		registrationState?: string;
		category?: {
			_id: string;
			name: string;
		};
		hasLocation?: boolean;
		// Verification details
		gpsCheckPassed?: boolean;
		gpsOverrideUsed?: boolean;
		condition?: string;
		operationalStatus?: string;
		repairNeeded?: boolean;
		investigationStatus?: string | null;
	};
}

export interface RecentActivitiesResponse {
	success: boolean;
	results: RecentActivityItem[];
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

const getRecentActivities = (limit: number = 10) =>
	apiClient.get<RecentActivitiesResponse>({
		url: `${API_ENDPOINTS.VERIFICATIONS.BASE}/recent-activities?limit=${limit}`,
	});

export default {
	getDashboardData,
	getStats,
	getRecentActivity,
	getRecentActivities,
};
