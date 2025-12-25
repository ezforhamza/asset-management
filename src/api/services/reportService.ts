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
import apiClient from "../apiClient";
import API_ENDPOINTS from "../endpoints";

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
	const { userToken } = require("@/store/userStore").default.getState();
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

export default {
	getVerificationReport,
	getOverdueAssets,
	getMapAssets,
	getDashboardStats,
	exportReport,
};
