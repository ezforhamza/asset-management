export enum BasicStatus {
	DISABLE = 0,
	ENABLE = 1,
}

// Asset Guard - Verification Status
export enum VerificationStatus {
	ON_TIME = "on_time",
	DUE_SOON = "due_soon",
	OVERDUE = "overdue",
}

// Asset Guard - User Roles
export enum UserRole {
	FIELD_USER = "field_user",
	CUSTOMER_ADMIN = "customer_admin",
	SYSTEM_ADMIN = "system_admin",
}

// Asset Guard - Admin Types (for customer_admin role only)
export enum AdminType {
	FULL = "full",
	READ_ONLY = "read_only",
}

// Asset Guard - Asset Status
export enum AssetStatus {
	ACTIVE = "active",
	RETIRED = "retired",
	TRANSFERRED = "transferred",
}

// Asset Guard - Condition Status
export enum ConditionStatus {
	GOOD = "good",
	FAIR = "fair",
	POOR = "poor",
}

// Asset Guard - Operational Status
export enum OperationalStatus {
	OPERATIONAL = "operational",
	NEEDS_REPAIR = "needs_repair",
	NON_OPERATIONAL = "non_operational",
}

// Asset Guard - Investigation Status
export enum InvestigationStatus {
	OPEN = "open",
	INVESTIGATING = "investigating",
	RESOLVED = "resolved",
}

export enum ResultStatus {
	SUCCESS = 0,
	ERROR = -1,
	TIMEOUT = 401,
}

export enum StorageEnum {
	UserInfo = "userInfo",
	UserToken = "userToken",
	Settings = "settings",
	I18N = "i18nextLng",
}

export enum ThemeMode {
	Light = "light",
	Dark = "dark",
}

export enum ThemeLayout {
	Vertical = "vertical",
	Horizontal = "horizontal",
	Mini = "mini",
}

export enum ThemeColorPresets {
	Default = "default",
	Cyan = "cyan",
	Purple = "purple",
	Blue = "blue",
	Orange = "orange",
	Red = "red",
}

export enum LocalEnum {
	en_US = "en_US",
	zh_CN = "zh_CN",
}

export enum MultiTabOperation {
	FULLSCREEN = "fullscreen",
	REFRESH = "refresh",
	CLOSE = "close",
	CLOSEOTHERS = "closeOthers",
	CLOSEALL = "closeAll",
	CLOSELEFT = "closeLeft",
	CLOSERIGHT = "closeRight",
}

export enum PermissionType {
	GROUP = 0,
	CATALOGUE = 1,
	MENU = 2,
	COMPONENT = 3,
}

export enum HtmlDataAttribute {
	ColorPalette = "data-color-palette",
	ThemeMode = "data-theme-mode",
}
