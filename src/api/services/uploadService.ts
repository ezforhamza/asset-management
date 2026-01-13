import apiClient from "../apiClient";

// ============================================
// Upload Service
// ============================================

export interface UploadedImage {
	url: string;
	thumbnailUrl: string;
	metadata: {
		originalSize: number;
		compressedSize: number;
		compressionRatio: string;
		width: number;
		height: number;
		format: string;
		originalWidth: number;
		originalHeight: number;
	};
}

export interface UploadImagesRes {
	success: boolean;
	uploaded: number;
	images: UploadedImage[];
}

const uploadUserImage = async (file: File): Promise<UploadImagesRes> => {
	const formData = new FormData();
	formData.append("images", file);
	formData.append("folder", "assets");
	formData.append("subFolder", "profiles");

	// Don't set Content-Type header - let axios set it automatically with boundary
	return apiClient.post<UploadImagesRes>({
		url: "/uploads/images",
		data: formData,
	});
};

const uploadCompanyLogo = async (file: File): Promise<UploadImagesRes> => {
	const formData = new FormData();
	formData.append("images", file);
	formData.append("folder", "assets");
	formData.append("subFolder", "logos");

	// Don't set Content-Type header - let axios set it automatically with boundary
	return apiClient.post<UploadImagesRes>({
		url: "/uploads/images",
		data: formData,
	});
};

export default {
	uploadUserImage,
	uploadCompanyLogo,
};
