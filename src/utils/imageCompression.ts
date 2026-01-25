/**
 * Image Compression Utility
 * Compresses images to 80-90% quality before upload
 * Maintains acceptable visual quality while reducing file size
 */

export interface CompressionOptions {
	quality?: number; // 0-1, default 0.85 (85%)
	maxWidth?: number; // Maximum width in pixels
	maxHeight?: number; // Maximum height in pixels
	mimeType?: "image/jpeg" | "image/png" | "image/webp";
}

export interface CompressionResult {
	file: File;
	originalSize: number;
	compressedSize: number;
	compressionRatio: number;
	width: number;
	height: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
	quality: 0.85, // 85% quality (within 80-90% range)
	maxWidth: 1920,
	maxHeight: 1920,
	mimeType: "image/jpeg",
};

/**
 * Load an image file and return an HTMLImageElement
 */
const loadImage = (file: File): Promise<HTMLImageElement> => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = (error) => reject(new Error(`Failed to load image: ${error}`));
		img.src = URL.createObjectURL(file);
	});
};

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
const calculateDimensions = (
	originalWidth: number,
	originalHeight: number,
	maxWidth: number,
	maxHeight: number,
): { width: number; height: number } => {
	let width = originalWidth;
	let height = originalHeight;

	// Scale down if exceeds max dimensions
	if (width > maxWidth) {
		height = Math.round((height * maxWidth) / width);
		width = maxWidth;
	}

	if (height > maxHeight) {
		width = Math.round((width * maxHeight) / height);
		height = maxHeight;
	}

	return { width, height };
};

/**
 * Convert canvas to File
 */
const canvasToFile = (
	canvas: HTMLCanvasElement,
	fileName: string,
	mimeType: string,
	quality: number,
): Promise<File> => {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (!blob) {
					reject(new Error("Failed to create blob from canvas"));
					return;
				}
				// Preserve original filename but may change extension based on mimeType
				const extension = mimeType.split("/")[1];
				const baseName = fileName.replace(/\.[^/.]+$/, "");
				const newFileName = `${baseName}.${extension}`;
				const file = new File([blob], newFileName, { type: mimeType });
				resolve(file);
			},
			mimeType,
			quality,
		);
	});
};

/**
 * Compress a single image file
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise with compressed file and metadata
 */
export const compressImage = async (file: File, options: CompressionOptions = {}): Promise<CompressionResult> => {
	const opts = {
		quality: options.quality ?? DEFAULT_OPTIONS.quality ?? 0.85,
		maxWidth: options.maxWidth ?? DEFAULT_OPTIONS.maxWidth ?? 1920,
		maxHeight: options.maxHeight ?? DEFAULT_OPTIONS.maxHeight ?? 1920,
		mimeType: options.mimeType ?? DEFAULT_OPTIONS.mimeType ?? "image/jpeg",
	};

	// Skip compression for non-image files
	if (!file.type.startsWith("image/")) {
		throw new Error("File is not an image");
	}

	// Skip compression for very small files (< 50KB)
	if (file.size < 50 * 1024) {
		return {
			file,
			originalSize: file.size,
			compressedSize: file.size,
			compressionRatio: 1,
			width: 0,
			height: 0,
		};
	}

	const img = await loadImage(file);
	const { width, height } = calculateDimensions(img.naturalWidth, img.naturalHeight, opts.maxWidth, opts.maxHeight);

	// Create canvas and draw resized image
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext("2d");
	if (!ctx) {
		throw new Error("Failed to get canvas context");
	}

	// Use high-quality image smoothing
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = "high";
	ctx.drawImage(img, 0, 0, width, height);

	// Clean up object URL
	URL.revokeObjectURL(img.src);

	// Determine output mime type - use JPEG for better compression unless PNG is needed for transparency
	let outputMimeType = opts.mimeType;
	if (file.type === "image/png" && !options.mimeType) {
		// Convert PNG to JPEG for better compression unless explicitly set
		outputMimeType = "image/jpeg";
	}

	const compressedFile = await canvasToFile(canvas, file.name, outputMimeType, opts.quality);

	// If compression made the file larger, return original
	if (compressedFile.size >= file.size) {
		return {
			file,
			originalSize: file.size,
			compressedSize: file.size,
			compressionRatio: 1,
			width: img.naturalWidth,
			height: img.naturalHeight,
		};
	}

	return {
		file: compressedFile,
		originalSize: file.size,
		compressedSize: compressedFile.size,
		compressionRatio: Math.round((1 - compressedFile.size / file.size) * 100) / 100,
		width,
		height,
	};
};

/**
 * Compress multiple images
 * @param files - Array of image files to compress
 * @param options - Compression options
 * @returns Promise with array of compression results
 */
export const compressImages = async (files: File[], options: CompressionOptions = {}): Promise<CompressionResult[]> => {
	return Promise.all(files.map((file) => compressImage(file, options)));
};

/**
 * Check if a file needs compression based on size threshold
 * @param file - The file to check
 * @param thresholdKB - Size threshold in KB (default: 500KB)
 */
export const shouldCompress = (file: File, thresholdKB: number = 500): boolean => {
	return file.type.startsWith("image/") && file.size > thresholdKB * 1024;
};

export default {
	compressImage,
	compressImages,
	shouldCompress,
};
