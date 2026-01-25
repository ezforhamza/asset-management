import { compressImage } from "@/utils/imageCompression";
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

/**
 * Compress and upload a user profile image
 * Images are compressed to 80-90% quality before upload
 */
const uploadUserImage = async (file: File): Promise<UploadImagesRes> => {
	// Compress image before upload (80-90% quality)
	const compressionResult = await compressImage(file, { quality: 0.85 });
	const compressedFile = compressionResult.file;

	const formData = new FormData();
	formData.append("images", compressedFile);
	formData.append("folder", "assets");
	formData.append("subFolder", "profiles");

	// Don't set Content-Type header - let axios set it automatically with boundary
	return apiClient.post<UploadImagesRes>({
		url: "/uploads/images",
		data: formData,
	});
};

/**
 * Compress and upload a company logo
 * Images are compressed to 80-90% quality before upload
 */
const uploadCompanyLogo = async (file: File): Promise<UploadImagesRes> => {
	// Compress image before upload (80-90% quality)
	const compressionResult = await compressImage(file, { quality: 0.85 });
	const compressedFile = compressionResult.file;

	const formData = new FormData();
	formData.append("images", compressedFile);
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
