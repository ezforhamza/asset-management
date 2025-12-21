import apiClient from "../apiClient";
import API_ENDPOINTS from "../endpoints";

// ============================================
// Audit Log Types
// ============================================

export interface AuditLogPerformedBy {
	id: string;
	name: string;
	email: string;
	role: string;
}

export interface AuditLog {
	id: string;
	entityType: string;
	entityId: string;
	action: string;
	performedBy: AuditLogPerformedBy;
	companyId: string | null;
	timestamp: string;
	ipAddress: string | null;
	userAgent: string | null;
	changes?: {
		before: any;
		after: any;
	};
	metadata?: Record<string, any>;
}

export interface AuditLogsListParams {
	entityType?: string;
	entityId?: string;
	action?: string;
	performedBy?: string;
	startDate?: string;
	endDate?: string;
	sortBy?: string;
	limit?: number;
	page?: number;
}

export interface AuditLogsListRes {
	results: AuditLog[];
	page: number;
	limit: number;
	totalPages: number;
	totalResults: number;
}

// ============================================
// Audit Log Service
// ============================================

const getAuditLogs = (params?: AuditLogsListParams) =>
	apiClient.get<AuditLogsListRes>({ url: API_ENDPOINTS.AUDIT_LOGS.BASE, params });

const getAuditLogById = (id: string) => apiClient.get<AuditLog>({ url: `${API_ENDPOINTS.AUDIT_LOGS.BASE}/${id}` });

export default {
	getAuditLogs,
	getAuditLogById,
};
