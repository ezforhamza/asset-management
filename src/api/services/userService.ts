import type { UserInfo } from "#/entity";
import apiClient from "../apiClient";

// ============================================
// Auth Types
// ============================================

export interface SignInReq {
	email: string;
	password: string;
}

export interface TokenInfo {
	token: string;
	expires: string;
}

export interface SignInRes {
	user: UserInfo;
	tokens: {
		access: TokenInfo;
		refresh: TokenInfo;
	};
}

export interface RefreshTokenReq {
	refreshToken: string;
}

export interface RefreshTokenRes {
	access: TokenInfo;
	refresh: TokenInfo;
}

export interface ForgotPasswordReq {
	email: string;
}

export interface ResetPasswordReq {
	resetToken: string;
	newPassword: string;
}

export interface ChangePasswordReq {
	currentPassword: string;
	newPassword: string;
}

// ============================================
// MFA Types
// ============================================

export interface MFAStatusRes {
	enabled: boolean;
	passwordLastChanged?: string;
}

export interface MFASetupRes {
	qrCodeUrl: string;
	secret: string;
	backupCodes: string[];
}

export interface MFAVerifyReq {
	code: string;
}

// ============================================
// User Management Types (Customer Admin)
// ============================================

export interface CreateUserReq {
	name: string;
	email: string;
	password?: string;
	role: "field_user" | "customer_admin";
	adminType?: "full" | "read_only" | null;
	profilePic?: string;
}

export interface CreateUserRes {
	user: UserInfo;
	message: string;
	temporaryPassword?: string;
}

export interface UpdateUserReq {
	name?: string;
	email?: string;
	role?: "field_user" | "customer_admin";
	adminType?: "full" | "read_only" | null;
	status?: "active" | "inactive";
	profilePic?: string;
}

// Paginated response from real API
export interface PaginatedResponse<T> {
	results: T[];
	page: number;
	limit: number;
	totalPages: number;
	totalResults: number;
}

export interface UsersListRes extends PaginatedResponse<UserInfo> {}

// ============================================
// API Endpoints
// ============================================

enum AuthApi {
	Login = "/auth/login",
	Refresh = "/auth/refresh",
	ForgotPassword = "/auth/forgot-password",
	ResetPassword = "/auth/reset-password",
}

enum UserApi {
	Users = "/users",
	ChangePassword = "/auth/change-password",
	CreateFieldWorker = "/users/create-field-worker",
	MFA = "/users/mfa",
}

// ============================================
// Auth Service
// ============================================

const login = (data: SignInReq) => apiClient.post<SignInRes>({ url: AuthApi.Login, data });

const forgotPassword = (data: ForgotPasswordReq) =>
	apiClient.post<{ success: boolean; message: string }>({ url: AuthApi.ForgotPassword, data });

const resetPassword = (data: ResetPasswordReq) =>
	apiClient.post<{ success: boolean; message: string }>({ url: AuthApi.ResetPassword, data });

const changePassword = (data: ChangePasswordReq) =>
	apiClient.post<{ success: boolean; message: string }>({ url: UserApi.ChangePassword, data });

// ============================================
// User Management Service (Customer Admin)
// ============================================

export interface GetUsersParams {
	name?: string;
	role?: string;
	status?: string;
	companyId?: string;
	sortBy?: string;
	limit?: number;
	page?: number;
}

const getUsers = (params?: GetUsersParams) => apiClient.get<UsersListRes>({ url: UserApi.Users, params });

const getUserById = (userId: string) => apiClient.get<UserInfo>({ url: `${UserApi.Users}/${userId}` });

const createUser = (data: CreateUserReq) => apiClient.post<CreateUserRes>({ url: UserApi.Users, data });

const updateUser = (userId: string, data: UpdateUserReq) =>
	apiClient.patch<UserInfo>({ url: `${UserApi.Users}/${userId}`, data });

const deactivateUser = (userId: string) => apiClient.put<UserInfo>({ url: `${UserApi.Users}/${userId}/deactivate` });

const deleteUser = (userId: string) => apiClient.delete<void>({ url: `${UserApi.Users}/${userId}` });

const resetUserPassword = (userId: string) =>
	apiClient.post<{ success: boolean; temporaryPassword: string; message: string }>({
		url: `${UserApi.Users}/${userId}/reset-password`,
	});

// ============================================
// MFA Service
// ============================================

const getMFAStatus = () => apiClient.get<MFAStatusRes>({ url: `${UserApi.MFA}/status` });

const setupMFA = () => apiClient.post<MFASetupRes>({ url: `${UserApi.MFA}/setup` });

const verifyMFA = (data: MFAVerifyReq) => apiClient.post<{ success: boolean }>({ url: `${UserApi.MFA}/verify`, data });

const disableMFA = () => apiClient.delete<{ success: boolean }>({ url: UserApi.MFA });

export default {
	// Auth
	login,
	forgotPassword,
	resetPassword,
	changePassword,
	// User Management
	getUsers,
	getUserById,
	createUser,
	createFieldWorker: createUser, // Alias for backward compatibility
	updateUser,
	deactivateUser,
	deleteUser,
	resetUserPassword,
	// MFA
	getMFAStatus,
	setupMFA,
	verifyMFA,
	disableMFA,
};
