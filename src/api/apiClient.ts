import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { toast } from "sonner";
import { GLOBAL_CONFIG } from "@/global-config";
import { t } from "@/locales/i18n";
import userStore from "@/store/userStore";

// Return the backend error message directly without transformation
// Only sanitize truly technical messages (stack traces, code references)
const getErrorMessage = (rawMessage: string): string => {
	if (!rawMessage) {
		return "An error occurred. Please try again.";
	}

	const msg = rawMessage.toLowerCase();

	// Only sanitize truly technical messages (stack traces, node internals)
	if (msg.includes("at /") || msg.includes("node_modules") || (msg.includes("error:") && msg.includes("at "))) {
		return "An error occurred. Please try again.";
	}

	// Return the backend message as-is
	return rawMessage;
};

const axiosInstance = axios.create({
	baseURL: GLOBAL_CONFIG.apiBaseUrl,
	timeout: 50000,
	headers: { "Content-Type": "application/json;charset=utf-8" },
});

// Request interceptor - Add JWT token and handle FormData
axiosInstance.interceptors.request.use(
	(config) => {
		const { userToken } = userStore.getState();
		if (userToken?.accessToken) {
			config.headers.Authorization = `Bearer ${userToken.accessToken}`;
		}
		// Remove Content-Type for FormData - let browser set it with boundary
		if (config.data instanceof FormData) {
			delete config.headers["Content-Type"];
		}
		return config;
	},
	(error) => Promise.reject(error),
);

// Response interceptor - Handle token refresh and errors
axiosInstance.interceptors.response.use(
	(res: AxiosResponse) => {
		// Backend returns { success, data, message } or direct data
		const responseData = res.data;

		// If response has success field, check it
		if (responseData && typeof responseData.success === "boolean") {
			if (responseData.success) {
				return responseData.data !== undefined ? responseData.data : responseData;
			}
			throw new Error(responseData.message || responseData.error || t("sys.api.apiRequestFailed"));
		}

		// Otherwise return raw data
		return responseData;
	},
	async (error: AxiosError<{ code?: number; success?: boolean; error?: string; message?: string }>) => {
		const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
		const { response } = error || {};

		// Check if this is a network error (server unreachable)
		const isNetworkError = !response && (error.code === "ERR_NETWORK" || error.message === "Network Error");

		// Skip token refresh/redirect logic for auth endpoints (login, register, forgot-password)
		const isAuthEndpoint =
			originalRequest?.url?.includes("/auth/login") ||
			originalRequest?.url?.includes("/auth/forgot-password") ||
			originalRequest?.url?.includes("/auth/reset-password");

		// Handle network errors - do NOT logout or switch roles
		if (isNetworkError) {
			toast.error("Server unreachable. Please check your connection.", { position: "top-center" });
			return Promise.reject(error);
		}

		// Handle 401 - Try to refresh token (but not for auth endpoints)
		if (response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
			originalRequest._retry = true;

			const { userToken, actions } = userStore.getState();

			if (userToken?.refreshToken) {
				try {
					const refreshRes = await axios.post(`${GLOBAL_CONFIG.apiBaseUrl}/auth/refresh-tokens`, {
						refreshToken: userToken.refreshToken,
					});

					if (refreshRes.data?.access?.token) {
						actions.setUserToken({
							accessToken: refreshRes.data.access.token,
							refreshToken: refreshRes.data.refresh?.token || userToken.refreshToken,
						});

						// Retry original request with new token
						if (originalRequest.headers) {
							originalRequest.headers.Authorization = `Bearer ${refreshRes.data.access.token}`;
						}
						return axiosInstance(originalRequest);
					}
				} catch (refreshError) {
					// Check if refresh failed due to network error - don't logout
					const isRefreshNetworkError =
						!(refreshError as AxiosError).response &&
						((refreshError as AxiosError).code === "ERR_NETWORK" ||
							(refreshError as AxiosError).message === "Network Error");

					if (isRefreshNetworkError) {
						toast.error("Server unreachable. Please check your connection.", { position: "top-center" });
						return Promise.reject(error);
					}

					// Refresh failed due to invalid token - clear tokens and redirect to login
					actions.clearUserInfoAndToken();
					toast.error("Session expired or terminated. Please log in again.", { position: "top-center" });
					window.location.href = "/auth/login";
					return Promise.reject(error);
				}
			}

			// No refresh token - clear and redirect
			actions.clearUserInfoAndToken();
			toast.error("Session expired or terminated. Please log in again.", { position: "top-center" });
			window.location.href = "/auth/login";
		}

		// Show error toast for non-auth endpoints (auth endpoints handle their own errors)
		if (!isAuthEndpoint && response) {
			const rawMsg = response?.data?.message || response?.data?.error || error.message || t("sys.api.errorMessage");
			const errMsg = getErrorMessage(rawMsg);
			toast.error(errMsg, { position: "top-center" });
		}

		return Promise.reject(error);
	},
);

class APIClient {
	get<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "GET" });
	}
	post<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "POST" });
	}
	put<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "PUT" });
	}
	patch<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "PATCH" });
	}
	delete<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "DELETE" });
	}
	request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return axiosInstance.request<any, T>(config);
	}
}

export default new APIClient();
