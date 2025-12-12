import apiClient from "../apiClient";

import type { Verification, MapAsset } from "#/entity";

// ============================================
// Report Types
// ============================================

export interface ReportParams {
	startDate?: string;
	endDate?: string;
	status?: "on_time" | "due_soon" | "overdue";
	verifiedBy?: string;
	page?: number;
	limit?: number;
}

export interface ReportRes {
	data: Verification[];
	pagination: {
		total: number;
		page: number;
		pages: number;
	};
}

export interface ScheduleReportReq {
	frequency: "daily" | "weekly" | "monthly";
	dayOfWeek?: number;
	dayOfMonth?: number;
	recipients: string[];
	reportType: "verification_summary" | "overdue_assets";
	includeAttachment: boolean;
}

export interface ScheduledReport {
	_id: string;
	frequency: string;
	recipients: string[];
	reportType: string;
	lastSent: string | null;
	nextScheduled: string;
	isActive: boolean;
}

// ============================================
// API Endpoints
// ============================================

enum ReportApi {
	Verifications = "/reports/verifications",
	Export = "/reports/export",
	Schedules = "/reports/schedules",
}

enum MapApi {
	Assets = "/map/assets",
}

// ============================================
// Report Service
// ============================================

const getVerificationReport = (params?: ReportParams) =>
	apiClient.get<ReportRes>({ url: ReportApi.Verifications, params });

const exportReport = (params: { format: "csv" | "pdf"; startDate?: string; endDate?: string }) => {
	const queryString = new URLSearchParams(params as Record<string, string>).toString();
	window.open(`${ReportApi.Export}?${queryString}`, "_blank");
};

const createSchedule = (data: ScheduleReportReq) =>
	apiClient.post<{ success: boolean; scheduleId: string; message: string }>({
		url: ReportApi.Schedules,
		data,
	});

const getSchedules = () => apiClient.get<ScheduledReport[]>({ url: ReportApi.Schedules });

const deleteSchedule = (scheduleId: string) =>
	apiClient.delete<{ success: boolean; message: string }>({ url: `${ReportApi.Schedules}/${scheduleId}` });

// ============================================
// Map Service
// ============================================

const getMapAssets = (params?: { status?: string }) => apiClient.get<MapAsset[]>({ url: MapApi.Assets, params });

export default {
	// Reports
	getVerificationReport,
	exportReport,
	createSchedule,
	getSchedules,
	deleteSchedule,
	// Map
	getMapAssets,
};
