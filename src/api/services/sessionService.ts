import type { UserInfo } from "#/entity";
import apiClient from "../apiClient";

// ============================================
// Session Types
// ============================================

export interface Session {
	id: string;
	userId: string;
	userAgent: string;
	ipAddress: string;
	createdAt: string;
	lastActivityAt: string;
	expiresAt: string;
	isActive: boolean;
	terminatedAt?: string | null;
	terminationReason?: string | null;
}

export interface SessionUserSummary {
	userId: string;
	userName: string;
	userEmail: string;
	userRole: string;
	userStatus: string;
	hasActiveSession: boolean;
	activeSessionCount: number;
	lastActivityAt: string | null;
	lastSessionCreatedAt: string | null;
	totalSessions: number;
}

export interface SessionsListRes {
	results: SessionUserSummary[];
	page: number;
	limit: number;
	totalPages: number;
	totalResults: number;
}

// Backend returns paginated response for GET /sessions/user/:userId
export interface UserSessionsRes {
	results: Session[];
	page: number;
	limit: number;
	totalPages: number;
	totalResults: number;
}

export interface CurrentSessionRes {
	session: Session;
	user: UserInfo;
}

// ============================================
// Session API Endpoints
// ============================================

enum SessionApi {
	Base = "/sessions",
	Me = "/sessions/me",
	Logout = "/sessions/logout",
	Users = "/sessions/users",
	UserSessions = "/sessions/user", // + /:userId
}

// ============================================
// User Session APIs
// ============================================

const getCurrentSession = () => apiClient.get<CurrentSessionRes>({ url: SessionApi.Me });

const logout = () => apiClient.post<{ success: boolean; message: string }>({ url: SessionApi.Logout });

// ============================================
// Admin Session APIs
// ============================================

export interface GetSessionUsersParams {
	role?: string;
	adminType?: string;
	status?: string;
	search?: string;
	limit?: number;
	page?: number;
}

const getSessionUsers = (params?: GetSessionUsersParams) =>
	apiClient.get<SessionsListRes>({ url: SessionApi.Users, params });

const getUserSessions = (userId: string) =>
	apiClient.get<UserSessionsRes>({ url: `${SessionApi.UserSessions}/${userId}` });

const terminateSession = (sessionId: string) =>
	apiClient.delete<{ success: boolean; message: string }>({ url: `${SessionApi.Base}/${sessionId}` });

const terminateAllUserSessions = (userId: string) =>
	apiClient.delete<{ success: boolean; message: string }>({ url: `${SessionApi.UserSessions}/${userId}/all` });

export default {
	// User APIs
	getCurrentSession,
	logout,
	// Admin APIs
	getSessionUsers,
	getUserSessions,
	terminateSession,
	terminateAllUserSessions,
};
