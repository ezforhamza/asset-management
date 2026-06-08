import apiClient from "../apiClient";
import API_ENDPOINTS from "../endpoints";

export interface SearchUserResult {
	id: string;
	name: string;
	email: string;
	role: string;
	phone?: string | null;
	status: string;
	companyId: string;
	companyName: string;
	createdAt: string;
}

export interface SearchAssetResult {
	id: string;
	serialNumber: string;
	make: string;
	model: string;
	siteName?: string;
	client?: string;
	status: string;
	companyId: string;
	companyName: string;
	categoryName?: string;
}

export interface SearchQrCodeResult {
	id: string;
	qrCode: string;
	status: string;
	companyId: string;
	companyName: string;
	assetSerialNumber?: string;
}

export interface SearchResults {
	query: string;
	type: string;
	results: {
		users?: { total: number; results: SearchUserResult[] };
		assets?: { total: number; results: SearchAssetResult[] };
		qrcodes?: { total: number; results: SearchQrCodeResult[] };
	};
}

export type SearchType = "all" | "users" | "assets" | "qrcodes";

const search = (q: string, type: SearchType = "all", limit = 10) =>
	apiClient.get<SearchResults>({
		url: API_ENDPOINTS.SEARCH,
		params: { q, type, limit },
	});

export default { search };
