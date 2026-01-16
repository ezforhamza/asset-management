import { format } from "date-fns";
import {
	ArrowLeft,
	CheckCircle2,
	Clock,
	Code,
	FileText,
	Globe,
	Image,
	Info,
	MapPin,
	Monitor,
	Package,
	QrCode,
	Smartphone,
	Trash2,
	User,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import type { AuditLog } from "@/api/services/auditLogService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent } from "@/ui/dialog";
import { Separator } from "@/ui/separator";
import { getAuditActionBadge, StyledBadge } from "@/utils/badge-styles";

// Field label mappings for different entity types
const fieldLabelMaps: Record<string, Record<string, string>> = {
	user: {
		role: "User Role",
		isEmailVerified: "Email Verified",
		mfaEnabled: "Multi-Factor Authentication",
		isDefaultAdmin: "Default Admin",
		email: "Email",
		name: "Name",
		companyId: "Company ID",
		mustChangePassword: "Password Change Required",
		createdAt: "Date Created",
		updatedAt: "Date Updated",
		status: "Status",
		profilePic: "Profile Picture",
		devicePlatform: "Device Platform",
		lastLogin: "Last Login",
		id: "User ID",
	},
	company: {
		companyName: "Company Name",
		contactEmail: "Contact Email",
		phone: "Phone Number",
		address: "Address",
		logo: "Logo",
		isActive: "Active Status",
		createdAt: "Date Created",
		updatedAt: "Date Updated",
		settings: "Settings",
		verificationFrequency: "Verification Frequency",
		geofenceThreshold: "Geofence Threshold",
		allowGPSOverride: "Allow GPS Override",
		imageRetentionDays: "Image Retention Days",
		repairNotificationEmails: "Repair Notification Emails",
		dueSoonDays: "Due Soon Days",
		totalAssets: "Total Assets",
		totalUsers: "Total Users",
		id: "Company ID",
	},
	verification: {
		assetId: "Asset ID",
		verifiedBy: "Verified By",
		verificationDate: "Verification Date",
		status: "Status",
		location: "Location",
		coordinates: "Coordinates",
		imageUrl: "Image URL",
		images: "Images",
		notes: "Notes",
		createdAt: "Date Created",
		updatedAt: "Date Updated",
		companyId: "Company ID",
		gpsAccuracy: "GPS Accuracy",
		deviceInfo: "Device Info",
		id: "Verification ID",
	},
	asset: {
		serialNumber: "Serial Number",
		make: "Make",
		model: "Model",
		status: "Status",
		companyId: "Company ID",
		qrCodeId: "QR Code ID",
		qrCode: "QR Code",
		location: "Location",
		coordinates: "Coordinates",
		lastVerifiedAt: "Last Verified",
		nextVerificationDue: "Next Verification Due",
		verificationFrequency: "Verification Frequency",
		geofenceThreshold: "Geofence Threshold",
		notes: "Notes",
		createdAt: "Date Created",
		updatedAt: "Date Updated",
		verificationStatus: "Verification Status",
		id: "Asset ID",
	},
	qr_code: {
		qrCode: "QR Code",
		status: "Status",
		companyId: "Company ID",
		assetId: "Asset ID",
		allocatedAt: "Allocated Date",
		usedAt: "Used Date",
		retiredAt: "Retired Date",
		createdAt: "Date Created",
		updatedAt: "Date Updated",
		id: "QR Code ID",
	},
	qrCode: {
		qrCode: "QR Code",
		status: "Status",
		companyId: "Company ID",
		assetId: "Asset ID",
		allocatedAt: "Allocated Date",
		usedAt: "Used Date",
		retiredAt: "Retired Date",
		createdAt: "Date Created",
		updatedAt: "Date Updated",
		id: "QR Code ID",
	},
};

const getFieldLabel = (entityType: string, fieldKey: string): string => {
	const entityMap = fieldLabelMaps[entityType] || {};
	if (entityMap[fieldKey]) {
		return entityMap[fieldKey];
	}
	// Fallback: convert camelCase to Title Case
	return fieldKey
		.replace(/([A-Z])/g, " $1")
		.replace(/^./, (str) => str.toUpperCase())
		.trim();
};

const renderValue = (value: any, key?: string): string => {
	if (value === null || value === undefined) return "";
	if (typeof value === "boolean") return value ? "Yes" : "No";

	// Handle dates
	if (typeof value === "string" && isISODate(value)) {
		return formatDate(value);
	}

	if (typeof value === "object") {
		// Handle arrays
		if (Array.isArray(value)) {
			if (value.length === 0) return "";
			// If array of strings, join them
			if (value.every((v) => typeof v === "string")) {
				return value.join(", ");
			}
			return `${value.length} item${value.length > 1 ? "s" : ""}`;
		}
		// Handle coordinates
		if (value.type === "Point" && value.coordinates) {
			return `${value.coordinates[1].toFixed(6)}, ${value.coordinates[0].toFixed(6)}`;
		}
		// Handle verification/condition details - format nicely
		if (key === "verificationDetails" || key === "conditionDetails") {
			const parts: string[] = [];
			if (value.conditionStatus) parts.push(`Condition: ${value.conditionStatus}`);
			if (value.operationalStatus) parts.push(`Operational: ${value.operationalStatus.replace(/_/g, " ")}`);
			if (value.conditionExplanation && value.conditionExplanation !== "NA")
				parts.push(`Note: ${value.conditionExplanation}`);
			return parts.length > 0 ? parts.join(" • ") : "";
		}
		// Handle location object
		if (value.latitude !== undefined && value.longitude !== undefined) {
			return `${value.latitude.toFixed(6)}, ${value.longitude.toFixed(6)}`;
		}
		// For other objects, don't show raw JSON
		return "";
	}
	return String(value);
};

// Check if a value is an image URL
const isImageUrl = (value: any): boolean => {
	if (typeof value !== "string") return false;
	return (
		value.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) !== null ||
		value.includes("cloudinary") ||
		value.includes("amazonaws.com") ||
		value.includes("blob.core.windows.net")
	);
};

// Extract all images from data object
const extractImages = (data: any): string[] => {
	if (!data) return [];
	const images: string[] = [];

	const findImages = (obj: any) => {
		if (!obj || typeof obj !== "object") {
			if (isImageUrl(obj)) images.push(obj);
			return;
		}
		if (Array.isArray(obj)) {
			obj.forEach((item) => {
				if (isImageUrl(item)) images.push(item);
				else if (typeof item === "object") findImages(item);
			});
			return;
		}
		for (const [key, value] of Object.entries(obj)) {
			if (key === "images" || key === "imageUrl" || key === "image" || key === "profilePic" || key === "logo") {
				if (Array.isArray(value)) {
					value.forEach((v) => {
						if (isImageUrl(v)) images.push(v as string);
					});
				} else if (isImageUrl(value)) {
					images.push(value as string);
				}
			} else if (typeof value === "object") {
				findImages(value);
			}
		}
	};

	findImages(data);
	return [...new Set(images)]; // Remove duplicates
};

// Fields to exclude from display
const excludedFields = [
	"_id",
	"__v",
	"id",
	"createdAt",
	"updatedAt",
	"password",
	"refreshToken",
	"fieldWorkerSetting",
	"fieldWorkerSettings", // Hide complex settings objects
	"companyId",
	"assetId",
	"userId",
	"verifiedBy",
	"qrCodeId", // Hide raw IDs
];

// Fields that are complex objects we should format specially or hide
const complexObjectFields = ["fieldWorkerSetting", "fieldWorkerSettings", "settings", "deviceInfo"];

// Check if a value is empty/null/undefined
const isEmptyValue = (value: any): boolean => {
	if (value === null || value === undefined) return true;
	if (value === "") return true;
	if (value === "—") return true;
	if (Array.isArray(value) && value.length === 0) return true;
	if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) return true;
	return false;
};

// Check if string looks like an ISO date
const isISODate = (value: string): boolean => {
	if (typeof value !== "string") return false;
	return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
};

// Format a date string nicely
const formatDate = (value: string): string => {
	try {
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return value;
		return format(date, "MMM d, yyyy 'at' h:mm a");
	} catch {
		return value;
	}
};

// Parse User Agent into readable format
const parseUserAgent = (ua: string): { browser: string; os: string; device: string } => {
	let browser = "Unknown Browser";
	let os = "Unknown OS";
	let device = "Desktop";

	// Detect browser
	if (ua.includes("Chrome") && !ua.includes("Edg")) {
		const match = ua.match(/Chrome\/(\d+)/);
		browser = `Chrome ${match ? match[1] : ""}`;
	} else if (ua.includes("Safari") && !ua.includes("Chrome")) {
		const match = ua.match(/Version\/(\d+)/);
		browser = `Safari ${match ? match[1] : ""}`;
	} else if (ua.includes("Firefox")) {
		const match = ua.match(/Firefox\/(\d+)/);
		browser = `Firefox ${match ? match[1] : ""}`;
	} else if (ua.includes("Edg")) {
		const match = ua.match(/Edg\/(\d+)/);
		browser = `Edge ${match ? match[1] : ""}`;
	}

	// Detect OS
	if (ua.includes("Windows")) {
		os = "Windows";
	} else if (ua.includes("Mac OS X")) {
		const match = ua.match(/Mac OS X ([\d_]+)/);
		os = `macOS ${match ? match[1].replace(/_/g, ".") : ""}`;
	} else if (ua.includes("Linux")) {
		os = "Linux";
	} else if (ua.includes("Android")) {
		const match = ua.match(/Android ([\d.]+)/);
		os = `Android ${match ? match[1] : ""}`;
		device = "Mobile";
	} else if (ua.includes("iPhone") || ua.includes("iPad")) {
		const match = ua.match(/OS ([\d_]+)/);
		os = `iOS ${match ? match[1].replace(/_/g, ".") : ""}`;
		device = ua.includes("iPad") ? "Tablet" : "Mobile";
	}

	return { browser: browser.trim(), os: os.trim(), device };
};

// Check if IP address is valid/meaningful
const isValidIP = (ip: string): boolean => {
	if (!ip) return false;
	if (ip === "::1" || ip === "127.0.0.1" || ip === "localhost") return false;
	return true;
};

// Priority fields to show first for each entity type
const priorityFields: Record<string, string[]> = {
	asset: ["serialNumber", "make", "model", "status", "qrCode", "location", "verificationStatus"],
	user: ["name", "email", "role", "status", "companyId"],
	company: ["companyName", "contactEmail", "phone", "isActive"],
	verification: ["status", "verificationDate", "location", "notes", "gpsAccuracy"],
	qr_code: ["qrCode", "status", "companyId", "assetId", "allocatedAt"],
	qrCode: ["qrCode", "status", "companyId", "assetId", "allocatedAt"],
};

// Get formatted display data for an entity
const getFormattedData = (
	data: any,
	entityType: string,
	userRole?: string,
): { key: string; label: string; value: string }[] => {
	if (!data) return [];

	const result: { key: string; label: string; value: string }[] = [];
	const priority = priorityFields[entityType] || [];
	const added = new Set<string>();

	// Additional exclusions based on context
	const contextExclusions = new Set<string>(excludedFields);

	// For customer_admin users, always hide fieldWorkerSetting
	if (userRole === "customer_admin") {
		contextExclusions.add("fieldWorkerSetting");
		contextExclusions.add("fieldWorkerSettings");
	}

	// Add priority fields first
	for (const key of priority) {
		if (data[key] !== undefined && !contextExclusions.has(key) && !isImageUrl(data[key])) {
			const rendered = renderValue(data[key], key);
			// Only add if we have a meaningful value
			if (rendered && !isEmptyValue(rendered)) {
				result.push({ key, label: getFieldLabel(entityType, key), value: rendered });
				added.add(key);
			}
		}
	}

	// Add remaining fields
	for (const [key, value] of Object.entries(data)) {
		if (!added.has(key) && !contextExclusions.has(key) && !key.startsWith("_") && !isImageUrl(value)) {
			// Skip image arrays
			if (Array.isArray(value) && value.length > 0 && isImageUrl(value[0])) continue;
			// Skip complex object fields
			if (complexObjectFields.includes(key)) continue;

			const rendered = renderValue(value, key);
			// Only add if we have a meaningful value
			if (rendered && !isEmptyValue(rendered)) {
				result.push({ key, label: getFieldLabel(entityType, key), value: rendered });
			}
		}
	}

	return result;
};

// Get action icon based on action type
const getActionIcon = (action: string) => {
	switch (action) {
		case "registered":
			return <Package className="h-5 w-5 text-green-600" />;
		case "deleted":
			return <Trash2 className="h-5 w-5 text-red-600" />;
		case "verified":
			return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
		case "created":
			return <Package className="h-5 w-5 text-green-600" />;
		case "updated":
			return <Code className="h-5 w-5 text-orange-600" />;
		default:
			return <Info className="h-5 w-5 text-primary" />;
	}
};

// Get action description
const getActionDescription = (log: AuditLog): { title: string; description: string } => {
	const entity = log.entityType.replace("_", " ");
	const entityCap = entity.charAt(0).toUpperCase() + entity.slice(1);
	const data = log.changes?.after || log.changes?.before || log.metadata;
	const identifier = data?.serialNumber || data?.qrCode || data?.name || data?.companyName || data?.email || "";

	switch (log.action) {
		case "registered":
			return {
				title: `${entityCap} Registered`,
				description: identifier
					? `"${identifier}" was registered successfully`
					: `A new ${entity} was registered in the system`,
			};
		case "deleted":
			return {
				title: `${entityCap} Deleted`,
				description: identifier ? `"${identifier}" was permanently deleted` : `A ${entity} was removed from the system`,
			};
		case "verified": {
			const status = data?.status || "verified";
			return {
				title: `${entityCap} Verified`,
				description: identifier
					? `"${identifier}" was verified with status: ${status}`
					: `Verification completed with status: ${status}`,
			};
		}
		case "created":
			return {
				title: `${entityCap} Created`,
				description: identifier ? `"${identifier}" was created` : `A new ${entity} was added to the system`,
			};
		case "updated":
			return {
				title: `${entityCap} Updated`,
				description: identifier ? `"${identifier}" was modified` : `${entityCap} details were updated`,
			};
		default:
			return {
				title: `${entityCap} ${log.action.charAt(0).toUpperCase() + log.action.slice(1)}`,
				description: `Action performed on ${entity}`,
			};
	}
};

// Get contextual message when no details are available
const getNoDetailsMessage = (log: AuditLog): { title: string; description: string } => {
	const entity = log.entityType.replace("_", " ");

	switch (log.action) {
		case "registered":
			return {
				title: "Registration Recorded",
				description: `This ${entity} registration was logged successfully. Detailed information was not captured at the time of registration.`,
			};
		case "deleted":
			return {
				title: "Deletion Recorded",
				description: `This ${entity} was deleted from the system. The original data is no longer available.`,
			};
		case "verified":
			return {
				title: "Verification Recorded",
				description: `This verification was completed successfully. Check the entity information for the ${entity} ID.`,
			};
		default:
			return {
				title: "Action Recorded",
				description: `This ${log.action} action was logged. Additional details were not captured.`,
			};
	}
};

// Render formatted details section
const renderFormattedDetails = (log: AuditLog) => {
	const data = log.changes?.after || log.changes?.before || log.metadata;

	// Get formatted data and images
	const formattedData = data ? getFormattedData(data, log.entityType) : [];
	const images = data ? extractImages(data) : [];
	const metaImages = log.metadata ? extractImages(log.metadata) : [];
	const allImages = [...new Set([...images, ...metaImages])];

	// Check if we have any meaningful content to show
	const hasContent = formattedData.length > 0 || allImages.length > 0;

	if (!hasContent) {
		const noDetailsMsg = getNoDetailsMessage(log);
		return (
			<div className="space-y-4">
				{/* Action Summary Banner */}
				<div
					className={`p-4 rounded-lg border-l-4 ${
						log.action === "deleted"
							? "bg-red-50 dark:bg-red-950/20 border-red-500"
							: log.action === "registered" || log.action === "created"
								? "bg-green-50 dark:bg-green-950/20 border-green-500"
								: log.action === "verified"
									? "bg-blue-50 dark:bg-blue-950/20 border-blue-500"
									: "bg-orange-50 dark:bg-orange-950/20 border-orange-500"
					}`}
				>
					<div className="flex items-start gap-3">
						{getActionIcon(log.action)}
						<div>
							<p className="font-medium">{getActionDescription(log).title}</p>
							<p className="text-sm text-muted-foreground mt-1">{getActionDescription(log).description}</p>
						</div>
					</div>
				</div>
				{/* No details message */}
				<div className="p-4 rounded-lg bg-muted/20 border border-dashed">
					<p className="text-sm font-medium text-muted-foreground">{noDetailsMsg.title}</p>
					<p className="text-xs text-muted-foreground mt-1">{noDetailsMsg.description}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Action Summary Banner */}
			<div
				className={`p-4 rounded-lg border-l-4 ${
					log.action === "deleted"
						? "bg-red-50 dark:bg-red-950/20 border-red-500"
						: log.action === "registered" || log.action === "created"
							? "bg-green-50 dark:bg-green-950/20 border-green-500"
							: log.action === "verified"
								? "bg-blue-50 dark:bg-blue-950/20 border-blue-500"
								: "bg-orange-50 dark:bg-orange-950/20 border-orange-500"
				}`}
			>
				<div className="flex items-start gap-3">
					{getActionIcon(log.action)}
					<div>
						<p className="font-medium">{getActionDescription(log).title}</p>
						<p className="text-sm text-muted-foreground mt-1">{getActionDescription(log).description}</p>
					</div>
				</div>
			</div>

			{/* Formatted Fields Grid */}
			{formattedData.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{formattedData.map(({ key, label, value }) => (
						<div key={key} className="p-3 rounded-lg bg-muted/30 border">
							<p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
							<p className="text-sm break-all">{value}</p>
						</div>
					))}
				</div>
			)}

			{/* Images Section */}
			{allImages.length > 0 && (
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<Image className="h-4 w-4 text-muted-foreground" />
						<p className="text-sm font-medium">Attached Images ({allImages.length})</p>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
						{allImages.map((url, index) => (
							<ImageThumbnail key={`${url}-${index}`} src={url} alt={`Image ${index + 1}`} />
						))}
					</div>
				</div>
			)}

			{/* Location Info if available */}
			{(data.location || data.coordinates || data.verifiedAtLocation) && (
				<div className="p-3 rounded-lg bg-muted/30 border">
					<div className="flex items-center gap-2 mb-2">
						<MapPin className="h-4 w-4 text-muted-foreground" />
						<p className="text-sm font-medium">Location</p>
					</div>
					<p className="text-sm text-muted-foreground">
						{data.location ||
							(data.coordinates?.type === "Point"
								? `${data.coordinates.coordinates[1]}, ${data.coordinates.coordinates[0]}`
								: null) ||
							(data.verifiedAtLocation
								? `${data.verifiedAtLocation.latitude}, ${data.verifiedAtLocation.longitude}`
								: "Location data available")}
					</p>
				</div>
			)}
		</div>
	);
};

// Render changes comparison for updates
const renderChangesComparison = (log: AuditLog) => {
	const { changes, entityType } = log;
	if (!changes) return renderFormattedDetails(log);

	const { before, after } = changes;

	// For deleted actions - show what was deleted
	if (before && !after) {
		return (
			<div className="space-y-4">
				<div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500">
					<div className="flex items-start gap-3">
						<Trash2 className="h-5 w-5 text-red-600" />
						<div>
							<p className="font-medium text-red-700 dark:text-red-400">Record Deleted</p>
							<p className="text-sm text-muted-foreground mt-1">The following data was removed from the system</p>
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{getFormattedData(before, entityType).map(({ key, label, value }) => (
						<div
							key={key}
							className="p-3 rounded-lg bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900"
						>
							<p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
							<p className="text-sm break-all line-through text-red-600 dark:text-red-400">{value}</p>
						</div>
					))}
				</div>
				{/* Show deleted images if any */}
				{extractImages(before).length > 0 && (
					<div className="space-y-3">
						<p className="text-sm font-medium text-muted-foreground">Deleted Images</p>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-3 opacity-60">
							{extractImages(before).map((url, index) => (
								<ImageThumbnail key={`${url}-${index}`} src={url} alt={`Deleted image ${index + 1}`} />
							))}
						</div>
					</div>
				)}
			</div>
		);
	}

	// For created/registered actions - show what was created
	if (!before && after) {
		return renderFormattedDetails(log);
	}

	// For updated actions - show before/after comparison
	if (before && after) {
		const changedFields = Object.keys(after).filter((key) => {
			if (key.startsWith("_") || key === "__v" || excludedFields.includes(key)) return false;
			return JSON.stringify(before[key]) !== JSON.stringify(after[key]);
		});

		if (changedFields.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<CheckCircle2 className="h-10 w-10 text-muted-foreground/50 mb-3" />
					<p className="text-sm text-muted-foreground">No field changes detected</p>
				</div>
			);
		}

		return (
			<div className="space-y-4">
				<div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border-l-4 border-orange-500">
					<div className="flex items-start gap-3">
						<Code className="h-5 w-5 text-orange-600" />
						<div>
							<p className="font-medium text-orange-700 dark:text-orange-400">
								{changedFields.length} Field(s) Modified
							</p>
							<p className="text-sm text-muted-foreground mt-1">Compare the changes made to this record</p>
						</div>
					</div>
				</div>
				<div className="space-y-4">
					{changedFields.map((key) => (
						<div key={key} className="p-4 rounded-lg bg-muted/30 border">
							<p className="text-sm font-medium mb-3">{getFieldLabel(entityType, key)}</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								<div className="p-3 rounded bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
									<div className="flex items-center gap-1.5 mb-2">
										<XCircle className="h-3.5 w-3.5 text-red-500" />
										<p className="text-xs font-medium text-red-600 dark:text-red-400">Before</p>
									</div>
									<p className="text-sm break-all">{renderValue(before[key])}</p>
								</div>
								<div className="p-3 rounded bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
									<div className="flex items-center gap-1.5 mb-2">
										<CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
										<p className="text-xs font-medium text-green-600 dark:text-green-400">After</p>
									</div>
									<p className="text-sm break-all">{renderValue(after[key])}</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	// Fallback - try to show formatted details from metadata
	return renderFormattedDetails(log);
};

// Image thumbnail component with preview
function ImageThumbnail({ src, alt }: { src: string; alt: string }) {
	const [isOpen, setIsOpen] = useState(false);
	const [hasError, setHasError] = useState(false);

	if (hasError) {
		return (
			<div className="aspect-square rounded-lg bg-muted flex items-center justify-center border">
				<Image className="h-6 w-6 text-muted-foreground/50" />
			</div>
		);
	}

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="aspect-square rounded-lg overflow-hidden border hover:border-primary transition-colors cursor-pointer"
			>
				<img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setHasError(true)} />
			</button>
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent className="max-w-3xl p-0 overflow-hidden">
					<img src={src} alt={alt} className="w-full h-auto" />
				</DialogContent>
			</Dialog>
		</>
	);
}

export default function AuditLogDetailPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const log = location.state?.log as AuditLog | undefined;

	if (!log) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="text-center">
					<h3 className="text-lg font-medium mb-2">Audit log not found</h3>
					<p className="text-sm text-muted-foreground mb-4">Please navigate from the audit logs list</p>
					<Button onClick={() => navigate("/admin/audit-logs")}>Back to Audit Logs</Button>
				</div>
			</div>
		);
	}

	// Get entity icon
	const getEntityIcon = () => {
		switch (log.entityType) {
			case "asset":
				return <Package className="h-5 w-5 text-primary" />;
			case "qr_code":
			case "qrCode":
				return <QrCode className="h-5 w-5 text-primary" />;
			case "user":
				return <User className="h-5 w-5 text-primary" />;
			default:
				return <FileText className="h-5 w-5 text-primary" />;
		}
	};

	return (
		<div className="h-screen flex flex-col bg-background">
			{/* Header - Fixed */}
			<div className="flex-shrink-0 border-b bg-card">
				<div className="px-6 py-4">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" onClick={() => navigate("/admin/audit-logs")} className="h-9 w-9">
							<ArrowLeft className="h-5 w-5" />
						</Button>
						<div className="flex-1 min-w-0">
							<h1 className="text-2xl font-semibold tracking-tight">Audit Log Details</h1>
							<p className="text-sm text-muted-foreground mt-1">
								{format(new Date(log.timestamp), "MMMM d, yyyy 'at' h:mm a")}
							</p>
						</div>
						{getAuditActionBadge(log.action)}
					</div>
				</div>
			</div>

			{/* Content - Scrollable */}
			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
				<div className="px-6 py-6 pb-16">
					<div className="max-w-6xl mx-auto space-y-6">
						{/* Quick Info Bar */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="p-4 rounded-lg border bg-card">
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
										{getEntityIcon()}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-xs text-muted-foreground">Entity Type</p>
										<p className="text-sm font-medium capitalize truncate">{log.entityType.replace("_", " ")}</p>
									</div>
								</div>
							</div>
							<div className="p-4 rounded-lg border bg-card">
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
										<User className="h-5 w-5 text-primary" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-xs text-muted-foreground">Performed By</p>
										<p className="text-sm font-medium truncate">{log.performedBy.name}</p>
									</div>
								</div>
							</div>
							<div className="p-4 rounded-lg border bg-card">
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
										<Clock className="h-5 w-5 text-primary" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-xs text-muted-foreground">Action</p>
										<p className="text-sm font-medium capitalize truncate">{log.action}</p>
									</div>
								</div>
							</div>
						</div>

						{/* Main Content Grid */}
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							{/* Left Column - 2/3 width */}
							<div className="lg:col-span-2 space-y-6">
								{/* Details Section */}
								<div className="rounded-lg border bg-card">
									<div className="p-6 border-b">
										<div className="flex items-center gap-2">
											{getActionIcon(log.action)}
											<h2 className="text-lg font-semibold">{getActionDescription(log).title}</h2>
										</div>
									</div>
									<div className="p-6">{renderChangesComparison(log)}</div>
								</div>

								{/* Additional Metadata Section */}
								{(() => {
									if (!log.metadata) return null;
									const filteredEntries = Object.entries(log.metadata).filter(([key, value]) => {
										if (isImageUrl(value)) return false;
										if (excludedFields.includes(key)) return false;
										if (complexObjectFields.includes(key)) return false;
										const rendered = renderValue(value, key);
										return rendered && !isEmptyValue(rendered);
									});
									if (filteredEntries.length === 0) return null;
									return (
										<div className="rounded-lg border bg-card">
											<div className="p-6 border-b">
												<div className="flex items-center gap-2">
													<Info className="h-5 w-5 text-primary" />
													<h2 className="text-lg font-semibold">Additional Information</h2>
												</div>
											</div>
											<div className="p-6">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
													{filteredEntries.map(([key, value]) => (
														<div key={key} className="p-3 rounded-lg bg-muted/30 border">
															<p className="text-xs font-medium text-muted-foreground mb-1">
																{getFieldLabel(log.entityType, key)}
															</p>
															<p className="text-sm break-all">{renderValue(value, key)}</p>
														</div>
													))}
												</div>
											</div>
										</div>
									);
								})()}
							</div>

							{/* Right Column - 1/3 width */}
							<div className="space-y-6">
								{/* User Information */}
								<div className="rounded-lg border bg-card">
									<div className="p-6 border-b">
										<div className="flex items-center gap-2">
											<User className="h-5 w-5 text-primary" />
											<h2 className="text-lg font-semibold">User Details</h2>
										</div>
									</div>
									<div className="p-6 space-y-4">
										<div>
											<p className="text-xs font-medium text-muted-foreground mb-1">Name</p>
											<p className="text-sm font-medium">{log.performedBy.name}</p>
										</div>
										<Separator />
										<div>
											<p className="text-xs font-medium text-muted-foreground mb-1">Email</p>
											<p className="text-sm break-all">{log.performedBy.email}</p>
										</div>
										<Separator />
										<div>
											<p className="text-xs font-medium text-muted-foreground mb-1">Role</p>
											<StyledBadge color="gray">{log.performedBy.role.replace("_", " ")}</StyledBadge>
										</div>
										<Separator />
										<div>
											<p className="text-xs font-medium text-muted-foreground mb-1">User ID</p>
											<p className="text-xs font-mono break-all text-muted-foreground">{log.performedBy.id}</p>
										</div>
									</div>
								</div>

								{/* Entity Information */}
								<div className="rounded-lg border bg-card">
									<div className="p-6 border-b">
										<div className="flex items-center gap-2">
											{getEntityIcon()}
											<h2 className="text-lg font-semibold">Entity Info</h2>
										</div>
									</div>
									<div className="p-6 space-y-4">
										<div>
											<p className="text-xs font-medium text-muted-foreground mb-1">Entity Type</p>
											<StyledBadge color="gray">{log.entityType.replace("_", " ")}</StyledBadge>
										</div>
										<Separator />
										<div>
											<p className="text-xs font-medium text-muted-foreground mb-1">Entity ID</p>
											<p className="text-xs font-mono break-all text-muted-foreground">{log.entityId}</p>
										</div>
										<Separator />
										<div>
											<p className="text-xs font-medium text-muted-foreground mb-1">Timestamp</p>
											<p className="text-sm">{format(new Date(log.timestamp), "PPpp")}</p>
										</div>
									</div>
								</div>

								{/* Technical Details */}
								{(isValidIP(log.ipAddress || "") || log.userAgent) && (
									<div className="rounded-lg border bg-card">
										<div className="p-6 border-b">
											<div className="flex items-center gap-2">
												<Globe className="h-5 w-5 text-primary" />
												<h2 className="text-lg font-semibold">Client Info</h2>
											</div>
										</div>
										<div className="p-6 space-y-4">
											{log.userAgent &&
												(() => {
													const parsed = parseUserAgent(log.userAgent);
													return (
														<div className="space-y-3">
															<div className="flex items-center gap-2">
																{parsed.device === "Mobile" ? (
																	<Smartphone className="h-4 w-4 text-muted-foreground" />
																) : (
																	<Monitor className="h-4 w-4 text-muted-foreground" />
																)}
																<span className="text-sm font-medium">{parsed.device}</span>
															</div>
															<div className="grid grid-cols-2 gap-3">
																<div className="p-2 rounded bg-muted/30">
																	<p className="text-xs text-muted-foreground">Browser</p>
																	<p className="text-sm font-medium">{parsed.browser}</p>
																</div>
																<div className="p-2 rounded bg-muted/30">
																	<p className="text-xs text-muted-foreground">Operating System</p>
																	<p className="text-sm font-medium">{parsed.os}</p>
																</div>
															</div>
														</div>
													);
												})()}
											{isValidIP(log.ipAddress || "") && (
												<>
													{log.userAgent && <Separator />}
													<div>
														<p className="text-xs font-medium text-muted-foreground mb-1">IP Address</p>
														<p className="text-sm font-mono">{log.ipAddress}</p>
													</div>
												</>
											)}
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
