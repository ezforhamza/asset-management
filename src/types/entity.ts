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
	companyId: string;
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
