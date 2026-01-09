// ============================================
// Centralized API Endpoints Configuration
// ============================================

export const API_ENDPOINTS = {
	// Auth
	AUTH: {
		LOGIN: "/auth/login",
		REFRESH_TOKENS: "/auth/refresh-tokens",
		LOGOUT: "/auth/logout",
		FORGOT_PASSWORD: "/auth/forgot-password",
		RESET_PASSWORD: "/auth/reset-password",
		VERIFY_EMAIL: "/auth/verify-email",
	},

	// Users
	USERS: {
		BASE: "/users",
		BY_ID: (id: string) => `/users/${id}`,
		CHANGE_PASSWORD: "/users/change-password",
		DEACTIVATE: (id: string) => `/users/${id}/deactivate`,
		RESET_PASSWORD: (id: string) => `/users/${id}/reset-password`,
	},

	// Companies
	COMPANIES: {
		BASE: "/companies",
		BY_ID: (id: string) => `/companies/${id}`,
		SETTINGS: (id: string) => `/companies/${id}/settings`,
	},

	// QR Codes
	QR_CODES: {
		BASE: "/qr",
		BY_ID: (id: string) => `/qr/${id}`,
		BULK: "/qr/bulk",
		BULK_IMPORT: "/qr/bulk-import",
	},

	// Assets
	ASSETS: {
		BASE: "/assets",
		BY_ID: (id: string) => `/assets/${id}`,
		BY_QR: (qrCode: string) => `/assets/by-qr/${qrCode}`,
		LOCATION: (id: string) => `/assets/${id}/location`,
		MAP: "/assets/map",
		STATS: "/assets/stats",
		BULK_IMPORT: "/assets/bulk-import",
		TRANSFER: "/assets/transfer",
	},

	// Verifications
	VERIFICATIONS: {
		BASE: "/verifications",
		BY_ID: (id: string) => `/verifications/${id}`,
		BY_ASSET: (assetId: string) => `/verifications/asset/${assetId}`,
		FLAGGED: "/verifications/flagged",
		INVESTIGATE: (id: string) => `/verifications/${id}/investigate`,
	},

	// Dashboard
	DASHBOARD: "/dashboard",

	// Admin
	ADMIN: {
		HEALTH: "/admin/health",
		MONITORING: "/admin/monitoring",
	},

	// Audit Logs
	AUDIT_LOGS: {
		BASE: "/audit-logs",
	},

	// Reports
	REPORTS: {
		VERIFICATIONS: "/reports/verifications",
		OVERDUE: "/reports/overdue",
		DASHBOARD: "/reports/dashboard",
		EXPORT: "/reports/export",
	},

	// Assets Map
	ASSETS_MAP: "/assets/map",

	// Uploads
	UPLOADS: {
		PHOTO: "/uploads/photo",
		BULK: "/uploads/bulk",
	},

	// Allocations
	ALLOCATIONS: {
		ALLOCATE: "/allocations/allocate",
		UNALLOCATE: "/allocations/unallocate",
		REASSIGN: "/allocations/reassign",
		SUMMARY: "/allocations/summary",
		FIELD_WORKER_ASSETS: (fieldWorkerId: string) => `/allocations/field-worker/${fieldWorkerId}/assets`,
		BULK_ALLOCATE: "/allocations/bulk-allocate",
	},
} as const;

export default API_ENDPOINTS;
