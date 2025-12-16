import apiClient from "../apiClient";

import type { UserInfo } from "#/entity";

// ============================================
// Auth Types
// ============================================

export interface SignInReq {
	email: string;
	password: string;
}

export interface SignInRes {
	success: boolean;
	accessToken: string;
	refreshToken: string;
	user: UserInfo;
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
	role: "field_user" | "customer_admin";
}

export interface CreateUserRes {
	success: boolean;
	userId: string;
	temporaryPassword: string;
	message: string;
}

export interface UpdateUserReq {
	name?: string;
	role?: "field_user" | "customer_admin";
}

export interface UsersListRes {
	success: boolean;
	users: UserInfo[];
}

// ============================================
// API Endpoints
// ============================================

enum AuthApi {
	Login = "/auth/login",
	Refresh = "/auth/refresh",
	ForgotPassword = "/auth/forgot-password",
	ResetPassword = "/auth/reset-password",
	ChangePassword = "/auth/change-password",
}

enum UserApi {
	Users = "/users",
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
	apiClient.post<{ success: boolean; message: string }>({ url: AuthApi.ChangePassword, data });

// ============================================
// User Management Service (Customer Admin)
// ============================================

const getUsers = (params?: { role?: string; status?: string }) =>
	apiClient.get<UserInfo[]>({ url: UserApi.Users, params });

const createFieldWorker = (data: CreateUserReq) =>
	apiClient.post<CreateUserRes>({ url: UserApi.CreateFieldWorker, data });

const updateUser = (userId: string, data: UpdateUserReq) =>
	apiClient.put<{ success: boolean; message: string }>({ url: `${UserApi.Users}/${userId}`, data });

const deactivateUser = (userId: string) =>
	apiClient.put<{ success: boolean; message: string }>({ url: `${UserApi.Users}/${userId}/deactivate` });

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
	createFieldWorker,
	updateUser,
	deactivateUser,
	resetUserPassword,
	// MFA
	getMFAStatus,
	setupMFA,
	verifyMFA,
	disableMFA,
};
