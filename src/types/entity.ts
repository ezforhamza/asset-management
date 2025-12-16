import type { NavItemDataProps } from "@/components/nav/types";
import type {
	BasicStatus,
	PermissionType,
	UserRole,
	AssetStatus,
	VerificationStatus,
	ConditionStatus,
	OperationalStatus,
	InvestigationStatus,
} from "./enum";

export interface UserToken {
	accessToken?: string;
	refreshToken?: string;
}

export interface UserInfo {
	id: string;
	email: string;
	username: string;
	name: string;
	password?: string;
	avatar?: string;
	role: UserRole;
	companyId?: string; // Optional for system_admin who doesn't belong to a company
	status?: BasicStatus;
	mustChangePassword?: boolean;
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
	_id: string;
	companyId: string;
	qrCodeId: string;
	serialNumber: string;
	make: string;
	model: string;
	registeredLocation: GeoLocation;
	locationAccuracy: number;
	registeredBy: string;
	registeredAt: string;
	status: AssetStatus;
	verificationFrequency: number;
	lastVerifiedAt: string | null;
	nextVerificationDue: string;
	photos: string[];
	createdAt: string;
	updatedAt: string;
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
	companyName: string;
	contactEmail: string;
	phone?: string;
	address?: string;
	settings: CompanySettings;
	isActive: boolean;
	createdAt: string;
	updatedAt?: string;
	// Computed fields for admin panel
	totalAssets?: number;
	totalUsers?: number;
}

export enum QRCodeStatus {
	AVAILABLE = "available",
	ALLOCATED = "allocated",
	USED = "used",
	RETIRED = "retired",
}

export interface QRCode {
	_id: string;
	qrCode: string;
	companyId: string | null;
	companyName?: string;
	assetId: string | null;
	assetSerialNumber?: string;
	status: QRCodeStatus;
	allocatedAt: string | null;
	linkedAt: string | null;
	createdAt: string;
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
