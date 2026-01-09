import type { Asset, AllocationSummary } from "#/entity";

import apiClient from "../apiClient";
import { API_ENDPOINTS } from "../endpoints";

// ============================================
// Request/Response Types
// ============================================

export interface AllocateAssetsReq {
	assetIds: string[];
	fieldWorkerId: string;
}

export interface UnallocateAssetsReq {
	assetIds: string[];
}

export interface ReassignAssetsReq {
	assetIds: string[];
	newFieldWorkerId: string;
}

export interface BulkAllocation {
	assetId: string;
	fieldWorkerId: string;
}

export interface BulkAllocateReq {
	allocations: BulkAllocation[];
}

export interface AllocationOperationRes {
	success: boolean;
	message: string;
	allocated?: string[];
	unallocated?: string[];
	reassigned?: string[];
	alreadyAllocated?: string[];
	notAllocated?: string[];
	notFound?: string[];
	wrongCompany?: string[];
	sameWorker?: string[];
}

export interface AllocationSummaryParams {
	companyId?: string;
}

export interface FieldWorkerAssetsParams {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface PaginatedAssets {
	results: Asset[];
	page: number;
	limit: number;
	totalPages: number;
	totalResults: number;
}

// ============================================
// Allocation Service
// ============================================

const allocationService = {
	/**
	 * Allocate assets to a field worker
	 */
	allocateAssets: (data: AllocateAssetsReq) =>
		apiClient.post<AllocationOperationRes>({
			url: API_ENDPOINTS.ALLOCATIONS.ALLOCATE,
			data,
		}),

	/**
	 * Unallocate assets from field workers
	 */
	unallocateAssets: (data: UnallocateAssetsReq) =>
		apiClient.post<AllocationOperationRes>({
			url: API_ENDPOINTS.ALLOCATIONS.UNALLOCATE,
			data,
		}),

	/**
	 * Reassign assets to a different field worker
	 */
	reassignAssets: (data: ReassignAssetsReq) =>
		apiClient.post<AllocationOperationRes>({
			url: API_ENDPOINTS.ALLOCATIONS.REASSIGN,
			data,
		}),

	/**
	 * Get allocation summary for a company
	 */
	getAllocationSummary: (params?: AllocationSummaryParams) =>
		apiClient.get<AllocationSummary>({
			url: API_ENDPOINTS.ALLOCATIONS.SUMMARY,
			params,
		}),

	/**
	 * Get assets allocated to a specific field worker
	 */
	getFieldWorkerAssets: (fieldWorkerId: string, params?: FieldWorkerAssetsParams) =>
		apiClient.get<PaginatedAssets>({
			url: API_ENDPOINTS.ALLOCATIONS.FIELD_WORKER_ASSETS(fieldWorkerId),
			params,
		}),

	/**
	 * Bulk allocate assets to different field workers
	 */
	bulkAllocateAssets: (data: BulkAllocateReq) =>
		apiClient.post<AllocationOperationRes>({
			url: API_ENDPOINTS.ALLOCATIONS.BULK_ALLOCATE,
			data,
		}),
};

export default allocationService;
