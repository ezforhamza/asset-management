import apiClient from "../apiClient";

// ============================================
// Asset Movement Types
// ============================================

export interface AssetMovementAsset {
	id: string;
	serialNumber: string;
	make: string;
	model: string;
}

export interface AssetMovementRequestedBy {
	id: string;
	name: string;
	email: string;
}

export interface AssetMovementLocation {
	description: string;
	coordinates?: {
		type: "Point";
		coordinates: [number, number];
	};
}

export interface AssetMovement {
	id: string;
	assetId: AssetMovementAsset;
	companyId: string;
	requestedBy: AssetMovementRequestedBy;
	status: "pending" | "in_progress" | "completed" | "cancelled";
	collectionDatetime: string;
	collectionLocation?: AssetMovementLocation;
	deliveryDestinationText: string;
	destinationType: "warehouse" | "client_location";
	movementInstructions?: string;
	createdAt: string;
	updatedAt?: string;
	completedAt?: string;
	cancellationReason?: string;
	completionNotes?: string;
}

export interface CreateAssetMovementReq {
	assetId: string;
	collectionDatetime: string;
	deliveryDestinationText: string;
	destinationType: "warehouse" | "client_location";
	movementInstructions?: string;
}

export interface AssetMovementListParams {
	status?: "pending" | "in_progress" | "completed" | "cancelled";
	assetId?: string;
	destinationType?: "warehouse" | "client_location";
	fromDate?: string;
	toDate?: string;
	sortBy?: string;
	limit?: number;
	page?: number;
}

export interface AssetMovementListRes {
	results: AssetMovement[];
	page: number;
	limit: number;
	totalPages: number;
	totalResults: number;
}

export interface DeleteAssetMovementReq {
	cancellationReason?: string;
}

export interface CompleteAssetMovementReq {
	completionNotes?: string;
}

// ============================================
// API Endpoints
// ============================================

enum AssetMovementApi {
	AssetMovements = "/asset-movements",
}

// ============================================
// Asset Movement Service
// ============================================

const getAssetMovements = (params?: AssetMovementListParams) =>
	apiClient.get<AssetMovementListRes>({ url: AssetMovementApi.AssetMovements, params });

const getAssetMovementById = (movementId: string) =>
	apiClient.get<AssetMovement>({ url: `${AssetMovementApi.AssetMovements}/${movementId}` });

const createAssetMovement = (data: CreateAssetMovementReq) =>
	apiClient.post<AssetMovement>({ url: AssetMovementApi.AssetMovements, data });

const deleteAssetMovement = (movementId: string, data?: DeleteAssetMovementReq) =>
	apiClient.delete<{ success: boolean; message: string }>({
		url: `${AssetMovementApi.AssetMovements}/${movementId}`,
		data,
	});

const startMovement = (movementId: string) =>
	apiClient.patch<AssetMovement>({
		url: `${AssetMovementApi.AssetMovements}/${movementId}/start`,
	});

const completeMovement = (movementId: string, data?: CompleteAssetMovementReq) =>
	apiClient.patch<AssetMovement>({
		url: `${AssetMovementApi.AssetMovements}/${movementId}/complete`,
		data,
	});

export default {
	getAssetMovements,
	getAssetMovementById,
	createAssetMovement,
	deleteAssetMovement,
	startMovement,
	completeMovement,
};
