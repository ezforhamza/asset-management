import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { toast } from "sonner";
import { GLOBAL_CONFIG } from "@/global-config";
import { t } from "@/locales/i18n";
import userStore from "@/store/userStore";

const axiosInstance = axios.create({
	baseURL: GLOBAL_CONFIG.apiBaseUrl,
	timeout: 50000,
	headers: { "Content-Type": "application/json;charset=utf-8" },
});

// Request interceptor - Add JWT token
axiosInstance.interceptors.request.use(
	(config) => {
		const { userToken } = userStore.getState();
		if (userToken?.accessToken) {
			config.headers.Authorization = `Bearer ${userToken.accessToken}`;
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
	async (error: AxiosError<{ success: boolean; error: string; message?: string }>) => {
		const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
		const { response } = error || {};

		// Skip token refresh/redirect logic for auth endpoints (login, register, forgot-password)
		const isAuthEndpoint =
			originalRequest.url?.includes("/auth/login") ||
			originalRequest.url?.includes("/auth/forgot-password") ||
			originalRequest.url?.includes("/auth/reset-password");

		// Handle 401 - Try to refresh token (but not for auth endpoints)
		if (response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
			originalRequest._retry = true;

			const { userToken, actions } = userStore.getState();

			if (userToken?.refreshToken) {
				try {
					const refreshRes = await axios.post(`${GLOBAL_CONFIG.apiBaseUrl}/auth/refresh`, {
						refreshToken: userToken.refreshToken,
					});

					if (refreshRes.data?.success && refreshRes.data?.accessToken) {
						actions.setUserToken({
							accessToken: refreshRes.data.accessToken,
							refreshToken: userToken.refreshToken,
						});

						// Retry original request with new token
						if (originalRequest.headers) {
							originalRequest.headers.Authorization = `Bearer ${refreshRes.data.accessToken}`;
						}
						return axiosInstance(originalRequest);
					}
				} catch {
					// Refresh failed - clear tokens and redirect to login
					actions.clearUserInfoAndToken();
					window.location.href = "/login";
					return Promise.reject(error);
				}
			}

			// No refresh token - clear and redirect
			actions.clearUserInfoAndToken();
			window.location.href = "/login";
		}

		// Show error toast for non-auth endpoints (auth endpoints handle their own errors)
		if (!isAuthEndpoint) {
			const errMsg = response?.data?.message || response?.data?.error || error.message || t("sys.api.errorMessage");
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
	delete<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "DELETE" });
	}
	request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return axiosInstance.request<any, T>(config);
	}
}

export default new APIClient();
