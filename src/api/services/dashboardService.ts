import apiClient from "../apiClient";

import type { DashboardStats, RecentActivity } from "#/entity";

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStatsRes {
	success: boolean;
	data: DashboardStats;
}

export interface RecentActivityRes {
	success: boolean;
	data: RecentActivity[];
}

// ============================================
// API Endpoints
// ============================================

enum DashboardApi {
	Stats = "/dashboard/stats",
	RecentActivity = "/dashboard/recent-activity",
}

// ============================================
// Dashboard Service
// ============================================

const getStats = () => apiClient.get<DashboardStats>({ url: DashboardApi.Stats });

const getRecentActivity = (limit = 10) =>
	apiClient.get<RecentActivity[]>({ url: DashboardApi.RecentActivity, params: { limit } });

export default {
	getStats,
	getRecentActivity,
};
