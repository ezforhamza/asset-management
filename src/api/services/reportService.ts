import type {
	DashboardStatsParams,
	DashboardStatsRes,
	ExportReportParams,
	MapAssetsParams,
	MapAssetsRes,
	OverdueAssetsParams,
	OverdueAssetsRes,
	VerificationReportParams,
	VerificationReportRes,
} from "#/report";
import useUserStore from "@/store/userStore";
import apiClient from "../apiClient";
import API_ENDPOINTS from "../endpoints";

// ============================================
// Scheduled Reports Types
// ============================================

export type ScheduledReportType = "verification_summary" | "asset_status" | "overdue_assets" | "compliance";
export type ScheduledReportFrequency = "daily" | "weekly" | "monthly" | "quarterly";
export type ScheduledReportFormat = "csv" | "pdf" | "xlsx";

export interface ScheduledReport {
	_id: string;
	name: string;
	reportType: ScheduledReportType;
	frequency: ScheduledReportFrequency;
	format: ScheduledReportFormat;
	recipients: string[];
	filters?: {
		includePhotos?: boolean;
		[key: string]: unknown;
	};
	isActive: boolean;
	nextScheduled?: string;
	lastRun?: string;
	companyId: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateScheduledReportReq {
	name: string;
	reportType: ScheduledReportType;
	frequency: ScheduledReportFrequency;
	format?: ScheduledReportFormat;
	recipients: string[];
	filters?: {
		includePhotos?: boolean;
		[key: string]: unknown;
	};
	isActive?: boolean;
}

export interface UpdateScheduledReportReq {
	name?: string;
	reportType?: ScheduledReportType;
	frequency?: ScheduledReportFrequency;
	format?: ScheduledReportFormat;
	recipients?: string[];
	filters?: {
		includePhotos?: boolean;
		[key: string]: unknown;
	};
	isActive?: boolean;
}

// Legacy interface for backward compatibility with existing component
export interface CreateScheduleReq {
	frequency: "daily" | "weekly" | "monthly";
	recipients: string[];
	reportType: string;
	includeAttachment: boolean;
}

// Re-export types for consumers
export type {
	VerificationReportParams,
	VerificationReportRes,
	OverdueAssetsParams,
	OverdueAssetsRes,
	MapAssetsParams,
	MapAssetsRes,
	DashboardStatsParams,
	DashboardStatsRes,
	ExportReportParams,
};

// ============================================
// Report Service
// ============================================

const getVerificationReport = (params?: VerificationReportParams) =>
	apiClient.get<VerificationReportRes>({ url: API_ENDPOINTS.REPORTS.VERIFICATIONS, params });

const getOverdueAssets = (params?: OverdueAssetsParams) =>
	apiClient.get<OverdueAssetsRes>({ url: API_ENDPOINTS.REPORTS.OVERDUE, params });

const getMapAssets = (params?: MapAssetsParams) =>
	apiClient.get<MapAssetsRes>({ url: API_ENDPOINTS.REPORTS.MAP, params });

const getDashboardStats = (params?: DashboardStatsParams) =>
	apiClient.get<DashboardStatsRes>({ url: API_ENDPOINTS.REPORTS.DASHBOARD, params });

const exportReport = (params: ExportReportParams) => {
	const queryString = new URLSearchParams(params as Record<string, string>).toString();
	const { userToken } = useUserStore.getState();
	const baseUrl = import.meta.env.VITE_APP_API_BASE_URL || "http://157.245.234.165/api/v1";
	const token = userToken?.accessToken;

	// Create a temporary link with auth token in header (using fetch to download)
	return fetch(`${baseUrl}${API_ENDPOINTS.REPORTS.EXPORT}?${queryString}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.blob();
		})
		.then((blob) => {
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `report_${params.reportType}_${new Date().toISOString().split("T")[0]}.${params.format}`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		})
		.catch((error) => {
			console.error("Export failed:", error);
			throw error;
		});
};

// ============================================
// Scheduled Reports Service
// ============================================

const getSchedules = () => apiClient.get<ScheduledReport[]>({ url: "/scheduled-reports" });

const getScheduleById = (scheduleId: string) =>
	apiClient.get<ScheduledReport>({ url: `/scheduled-reports/${scheduleId}` });

const createSchedule = (data: CreateScheduleReq | CreateScheduledReportReq) => {
	// Transform legacy format to new API format if needed
	const payload: CreateScheduledReportReq =
		"includeAttachment" in data
			? {
					name: `${data.frequency.charAt(0).toUpperCase() + data.frequency.slice(1)} ${data.reportType.replace(/_/g, " ")}`,
					reportType: data.reportType as ScheduledReportType,
					frequency: data.frequency,
					format: data.includeAttachment ? "csv" : "pdf",
					recipients: data.recipients,
					filters: { includePhotos: false },
					isActive: true,
				}
			: data;

	return apiClient.post<ScheduledReport>({ url: "/scheduled-reports", data: payload });
};

const updateSchedule = (scheduleId: string, data: UpdateScheduledReportReq) =>
	apiClient.patch<ScheduledReport>({ url: `/scheduled-reports/${scheduleId}`, data });

const deleteSchedule = (scheduleId: string) => apiClient.delete<void>({ url: `/scheduled-reports/${scheduleId}` });

// Toggle schedule active status
const toggleScheduleStatus = (scheduleId: string, isActive: boolean) =>
	apiClient.patch<ScheduledReport>({ url: `/scheduled-reports/${scheduleId}`, data: { isActive } });

export default {
	getVerificationReport,
	getOverdueAssets,
	getMapAssets,
	getDashboardStats,
	exportReport,
	// Scheduled Reports
	getSchedules,
	getScheduleById,
	createSchedule,
	updateSchedule,
	deleteSchedule,
	toggleScheduleStatus,
};
