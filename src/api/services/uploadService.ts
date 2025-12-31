import apiClient from "../apiClient";

// ============================================
// Upload Service
// ============================================

export interface UploadUserImageRes {
	success: boolean;
	url: string;
}

const uploadUserImage = async (file: File): Promise<UploadUserImageRes> => {
	const formData = new FormData();
	formData.append("image", file);

	return apiClient.post<UploadUserImageRes>({
		url: "/upload/user-image",
		data: formData,
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
};

export interface UploadCompanyLogoRes {
	success: boolean;
	url: string;
}

const uploadCompanyLogo = async (file: File): Promise<UploadCompanyLogoRes> => {
	const formData = new FormData();
	formData.append("image", file);

	// Using the same profile upload endpoint - the URL structure suggests it handles profile images
	return apiClient.post<UploadCompanyLogoRes>({
		url: "/upload/user-image",
		data: formData,
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
};

export default {
	uploadUserImage,
	uploadCompanyLogo,
};
