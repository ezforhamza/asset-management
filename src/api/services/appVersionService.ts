import apiClient from "../apiClient";

export type AppPlatform = "android" | "ios" | "huawei";

export interface AppVersionConfig {
	id: string;
	platform: AppPlatform;
	latestVersion: string;
	storeUrl: string;
	forceUpdateMessage?: string;
	isActive: boolean;
	updatedBy: string;
	updatedAt: string;
	createdAt: string;
}

export interface UpdateAppVersionReq {
	latestVersion: string;
	storeUrl: string;
	forceUpdateMessage?: string;
	isActive?: boolean;
}

const getAll = () => apiClient.get<AppVersionConfig[]>({ url: "/app-version" });

const updatePlatform = (platform: AppPlatform, data: UpdateAppVersionReq) =>
	apiClient.put<AppVersionConfig>({ url: `/app-version/${platform}`, data });

export default { getAll, updatePlatform };
