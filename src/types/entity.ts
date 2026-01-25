import type { NavItemDataProps } from "@/components/nav/types";
import type {
	AdminType,
	AssetStatus,
	BasicStatus,
	ConditionStatus,
	InvestigationStatus,
	OperationalStatus,
	PermissionType,
	UserRole,
	VerificationStatus,
} from "./enum";

export interface UserToken {
	accessToken?: string;
	refreshToken?: string;
}

export interface UserInfo {
	id: string;
	email: string;
	username?: string;
	name: string;
	password?: string;
	avatar?: string;
	profilePic?: string | null;
	role: UserRole;
	adminType?: AdminType | null;
	companyId?: string;
	status?: "active" | "inactive";
	isEmailVerified?: boolean;
	mustChangePassword?: boolean;
	mfaEnabled?: boolean;
	devicePlatform?: string | null;
	isDefaultAdmin?: boolean;
	lastLogin?: string;
	roles?: Role[];
	permissions?: Permission[];
	menu?: MenuTree[];
}

export interface Permission_Old {
	id: string;
	parentId: string;
	name: string;
	label: string;
	type: PermissionType;
	route: string;
	status?: BasicStatus;
	order?: number;
	icon?: string;
	component?: string;
	hide?: boolean;
	hideTab?: boolean;
	frameSrc?: URL;
	newFeature?: boolean;
	children?: Permission_Old[];
}

export interface Role_Old {
	id: string;
	name: string;
	code: string;
	status: BasicStatus;
	order?: number;
	desc?: string;
	permission?: Permission_Old[];
}

export interface CommonOptions {
	status?: BasicStatus;
	desc?: string;
	createdAt?: string;
	updatedAt?: string;
}
export interface User extends CommonOptions {
	id: string; // uuid
	username: string;
	password: string;
	email: string;
	phone?: string;
	avatar?: string;
}

export interface Role extends CommonOptions {
	id: string; // uuid
	name: string;
	code: string;
}

export interface Permission extends CommonOptions {
	id: string; // uuid
	name: string;
	code: string; // resource:action  example: "user-management:read"
}

export interface Menu extends CommonOptions, MenuMetaInfo {
	id: string; // uuid
	parentId: string;
	name: string;
	code: string;
	order?: number;
	type: PermissionType;
}

export type MenuMetaInfo = Partial<
	Pick<NavItemDataProps, "path" | "icon" | "caption" | "info" | "disabled" | "auth" | "hidden">
> & {
	externalLink?: URL;
	component?: string;
};

export type MenuTree = Menu & {
	children?: MenuTree[];
};

// ============================================
// Asset Guard Entities
// ============================================

export interface GeoLocation {
	latitude: number;
	longitude: number;
}

export interface Asset {
	id: string;
	_id?: string; // Backward compatibility
	companyId: string;
	qrCodeId:
		| string
		| {
				id: string;
				qrCode: string;
				status: string;
				companyId: string;
				assetId: string;
				allocatedAt: string;
				linkedAt: string | null;
		  };
	qrCode?: {
		id: string;
		code: string;
		status: string;
		linkedAt: string | null;
	} | null;
	serialNumber: string;
	make: string;
	model: string;
	category?: {
		id: string;
		name: string;
	} | null;
	condition?: string | null;
	channel?: string | null;
	siteName?: string | null;
	client?: string | null;
	registeredLocation: { type: string; coordinates: [number, number] } | GeoLocation;
	location?: {
		longitude: number;
		latitude: number;
		mapLink: string;
	} | null;
	locationAccuracy: number;
	locationDescription?: string | null;
	registeredBy:
		| string
		| { id: string; name: string; email: string; role?: string; status?: string; companyId?: string };
	registeredAt: string;
	status: AssetStatus;
	registrationState?: string;
	verificationFrequency: number | null;
	geofenceThreshold: number | null;
	lastVerifiedAt: string | null;
	nextVerificationDue: string;
	totalVerifications?: number;
	daysUntilDue?: number;
	photos: string[];
	notes?: string | null;
	allocatedTo?: string | null;
	createdAt?: string;
	updatedAt?: string;
	// Computed field for UI
	verificationStatus?: VerificationStatus;
}

export interface VerificationChecklist {
	conditionStatus: ConditionStatus;
	operationalStatus: OperationalStatus;
	repairNotes?: string;
}

export interface Verification {
	_id: string;
	assetId: string;
	companyId: string;
	verifiedBy: string;
	verifiedByName?: string;
	verifiedAt: string;
	scanLocation: GeoLocation;
	scanLocationAccuracy: number;
	distanceFromAsset: number;
	gpsCheckPassed: boolean;
	gpsRetryCount: number;
	gpsOverrideUsed: boolean;
	photos: string[];
	checklist: VerificationChecklist;
	repairNeeded: boolean;
	repairEmailSent: boolean;
	investigationStatus: InvestigationStatus | null;
	investigationComments: string[];
	createdAt: string;
	// Joined asset data for reports
	asset?: Asset;
}

export interface DashboardStats {
	totalAssets: number;
	verifiedThisMonth: number;
	verifiedPercentage: number;
	dueSoon: number;
	overdue: number;
}

export interface RecentActivity {
	_id: string;
	assetSerialNumber: string;
	assetMake: string;
	assetModel: string;
	verifiedBy: string;
	verifiedAt: string;
	status: VerificationStatus;
	distance: number;
}

export interface MapAsset {
	assetId: string;
	serialNumber: string;
	make: string;
	model: string;
	location: GeoLocation;
	status: VerificationStatus;
	lastVerified: string | null;
	nextVerificationDue?: string;
}

// ============================================
// Admin Panel Entities
// ============================================

export interface CompanySettings {
	verificationFrequency: number;
	geofenceThreshold: number;
	allowGPSOverride: boolean;
	imageRetentionDays: number;
	repairNotificationEmails: string[];
	dueSoonDays?: number;
}

export interface Company {
	_id: string;
	id?: string; // Backward compatibility
	companyName: string;
	contactEmail: string;
	phone?: string;
	address?: string;
	logo?: string;
	settings?: CompanySettings;
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
	totalAssets?: number;
	totalUsers?: number;
	stats?: {
		totalUsers: number;
		totalAssets: number;
		totalQRCodes: number;
		totalVerifications: number;
	};
	users?: UserInfo[];
}

export enum QRCodeStatus {
	AVAILABLE = "available",
	ALLOCATED = "allocated",
	USED = "used",
	RETIRED = "retired",
}

export interface QRCode {
	id: string;
	_id?: string; // Backward compatibility
	qrCode: string;
	companyId: string | { id: string; companyName: string; contactEmail: string; isActive: boolean } | null;
	companyName?: string;
	assetId: string | { id: string; serialNumber: string; make: string; model: string; status: string } | null;
	assetSerialNumber?: string;
	status: QRCodeStatus;
	allocatedAt: string | null;
	linkedAt: string | null;
	createdAt?: string;
}

export enum SyncStatus {
	PENDING = "pending",
	PROCESSING = "processing",
	COMPLETED = "completed",
	FAILED = "failed",
}

export interface SyncQueueItem {
	_id: string;
	userId: string;
	userName?: string;
	deviceId: string;
	queueData: {
		type: "registration" | "verification";
		assetId?: string;
		serialNumber?: string;
	};
	syncStatus: SyncStatus;
	attempts: number;
	error?: string;
	createdAt: string;
	processedAt?: string;
}

export interface SystemMonitoringStats {
	queuedUploads: number;
	failedSyncs: number;
	flaggedVerifications: number;
	apiResponseTime: number;
	dbConnections: number;
}

export interface AuditLog {
	_id: string;
	entityType: "asset" | "verification" | "qr_code" | "user" | "company";
	entityId: string;
	action: "created" | "updated" | "deleted" | "status_changed";
	performedBy: string;
	performedByName?: string;
	changes: Record<string, { old: unknown; new: unknown }>;
	timestamp: string;
	ipAddress?: string;
}

// ============================================
// Asset Allocation Entities
// ============================================

export interface FieldWorkerAllocationSummary {
	fieldWorkerId: string;
	name: string;
	email: string;
	allocatedAssets: number;
}

export interface AllocationSummary {
	totalAssets: number;
	allocatedAssets: number;
	unallocatedAssets: number;
	fieldWorkers: FieldWorkerAllocationSummary[];
}
