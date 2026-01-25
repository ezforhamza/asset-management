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
		CHANGE_PASSWORD: "/auth/change-password",
	},

	// Users
	USERS: {
		BASE: "/users",
		BY_ID: (id: string) => `/users/${id}`,
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
		FIELD_WORKER_PERFORMANCE: (userId: string) => `/reports/field-workers/${userId}/performance`,
	},

	// Assets Map
	ASSETS_MAP: "/assets/map",
	ASSETS_MAP_LOCATIONS: "/assets/map-locations",

	// Uploads
	UPLOADS: {
		PHOTO: "/uploads/photo",
		BULK: "/uploads/bulk",
	},

	// Sessions
	SESSIONS: {
		ME: "/sessions/me",
		LOGOUT: "/sessions/logout",
		USERS: "/sessions/users",
		USER_SESSIONS: (userId: string) => `/sessions/user/${userId}`,
		TERMINATE: (sessionId: string) => `/sessions/${sessionId}`,
		TERMINATE_ALL: (userId: string) => `/sessions/user/${userId}/all`,
	},
} as const;

export default API_ENDPOINTS;
