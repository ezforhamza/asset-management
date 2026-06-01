import userStore from "@/store/userStore";
import apiClient from "../apiClient";
import API_ENDPOINTS from "../endpoints";

export interface RepairRequest {
	id: string;
	companyId: string;
	assetId: {
		id: string;
		serialNumber: string;
		make: string;
		model: string;
		siteName: string;
	};
	verificationId?: string;
	requestedBy: {
		id: string;
		name: string;
		email: string;
		role: string;
	};
	source: "field_worker" | "customer_admin";
	operationalStatus?: "needs_repair" | "non_operational" | null;
	conditionStatus?: "good" | "fair" | "poor" | null;
	notes?: string;
	status: "open" | "acknowledged" | "resolved";
	emailSent: boolean;
	assetSnapshot: {
		serialNumber: string;
		make: string;
		model: string;
		categoryName: string;
		siteName: string;
	};
	createdAt: string;
	updatedAt: string;
}

export interface RepairRequestsListParams {
	search?: string;
	status?: string;
	source?: string;
	startDate?: string;
	endDate?: string;
	sortBy?: string;
	limit?: number;
	page?: number;
}

export interface RepairRequestsListRes {
	results: RepairRequest[];
	totalResults: number;
	page: number;
	limit: number;
	totalPages: number;
}

const getRepairRequests = (params?: RepairRequestsListParams) =>
	apiClient.get<RepairRequestsListRes>({ url: API_ENDPOINTS.REPAIR_REQUESTS.BASE, params });

const createRepairRequest = (assetId: string, data: { notes?: string }) =>
	apiClient.post<{ success: boolean; repairRequest: RepairRequest; message: string; emailSent: boolean }>({
		url: API_ENDPOINTS.REPAIR_REQUESTS.BY_ASSET(assetId),
		data,
	});

const updateRepairRequestStatus = (requestId: string, status: string) =>
	apiClient.patch<RepairRequest>({
		url: API_ENDPOINTS.REPAIR_REQUESTS.UPDATE_STATUS(requestId),
		data: { status },
	});

const exportRepairRequests = (params: {
	format?: "xlsx" | "pdf";
	startDate?: string;
	endDate?: string;
	status?: string;
	source?: string;
	categoryName?: string;
}) => {
	const { userToken } = userStore.getState();
	const token = userToken?.accessToken || "";

	const queryParams = new URLSearchParams();
	if (params.format) queryParams.append("format", params.format);
	if (params.startDate) queryParams.append("startDate", params.startDate);
	if (params.endDate) queryParams.append("endDate", params.endDate);
	if (params.status) queryParams.append("status", params.status);
	if (params.source) queryParams.append("source", params.source);
	if (params.categoryName) queryParams.append("categoryName", params.categoryName);

	const baseUrl = import.meta.env.VITE_APP_API_BASE_URL || "/api/v1";
	const ext = params.format === "pdf" ? "pdf" : "xlsx";
	const from = params.startDate || "all";
	const to = params.endDate || "all";

	return fetch(`${baseUrl}${API_ENDPOINTS.REPAIR_REQUESTS.EXPORT}?${queryParams.toString()}`, {
		headers: { Authorization: `Bearer ${token}` },
	})
		.then((res) => {
			if (!res.ok) throw new Error(`Export failed: ${res.status}`);
			return res.blob();
		})
		.then((blob) => {
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `repair-requests_${from}_to_${to}.${ext}`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		});
};

export default {
	getRepairRequests,
	createRepairRequest,
	updateRepairRequestStatus,
	exportRepairRequests,
};
