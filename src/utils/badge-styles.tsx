import { Badge } from "@/ui/badge";

/**
 * Standardized badge styles for consistent UI across the application.
 * All badges follow the same pattern: light background, darker text, and border.
 * Dark mode variants are included for each color.
 */

// Color style definitions
const badgeStyles = {
	blue: "bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700",
	orange: "bg-orange-100 text-orange-700 border border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-700",
	emerald: "bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700",
	green: "bg-green-100 text-green-700 border border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700",
	gray: "bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
	red: "bg-red-100 text-red-700 border border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-700",
	yellow: "bg-yellow-100 text-yellow-700 border border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-700",
	purple: "bg-purple-100 text-purple-700 border border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-700",
	cyan: "bg-cyan-100 text-cyan-700 border border-cyan-300 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-700",
	pink: "bg-pink-100 text-pink-700 border border-pink-300 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-700",
} as const;

type BadgeColor = keyof typeof badgeStyles;

// Helper to create a styled badge
export const StyledBadge = ({ color, children }: { color: BadgeColor; children: React.ReactNode }) => (
	<Badge className={badgeStyles[color]}>{children}</Badge>
);

// ============================================
// QR Code Status Badges
// ============================================
export const getQRStatusBadge = (status: string) => {
	switch (status) {
		case "available":
			return <StyledBadge color="blue">Available</StyledBadge>;
		case "allocated":
			return <StyledBadge color="orange">Allocated</StyledBadge>;
		case "used":
			return <StyledBadge color="emerald">Used</StyledBadge>;
		case "retired":
			return <StyledBadge color="gray">Retired</StyledBadge>;
		default:
			return <StyledBadge color="gray">{status}</StyledBadge>;
	}
};

// ============================================
// Company Status Badges
// ============================================
export const getCompanyStatusBadge = (status: string) => {
	switch (status?.toLowerCase()) {
		case "active":
			return <StyledBadge color="emerald">Active</StyledBadge>;
		case "inactive":
			return <StyledBadge color="gray">Inactive</StyledBadge>;
		case "suspended":
			return <StyledBadge color="red">Suspended</StyledBadge>;
		default:
			return <StyledBadge color="gray">{status}</StyledBadge>;
	}
};

// ============================================
// User Status Badges
// ============================================
export const getUserStatusBadge = (status: string) => {
	switch (status?.toLowerCase()) {
		case "active":
			return <StyledBadge color="emerald">Active</StyledBadge>;
		case "inactive":
			return <StyledBadge color="gray">Inactive</StyledBadge>;
		case "pending":
			return <StyledBadge color="yellow">Pending</StyledBadge>;
		case "suspended":
			return <StyledBadge color="red">Suspended</StyledBadge>;
		default:
			return <StyledBadge color="gray">{status}</StyledBadge>;
	}
};

// ============================================
// User Role Badges
// ============================================
export const getUserRoleBadge = (role: string) => {
	switch (role?.toLowerCase()) {
		case "systemadmin":
		case "system_admin":
			return <StyledBadge color="red">System Admin</StyledBadge>;
		case "companyadmin":
		case "company_admin":
		case "admin":
			return <StyledBadge color="purple">Admin</StyledBadge>;
		case "fieldworker":
		case "field_worker":
		case "user":
			return <StyledBadge color="blue">Field Worker</StyledBadge>;
		default:
			return <StyledBadge color="gray">{role}</StyledBadge>;
	}
};

// ============================================
// Audit Log Action Badges
// ============================================
export const getAuditActionBadge = (action: string) => {
	switch (action?.toLowerCase()) {
		case "created":
		case "create":
			return <StyledBadge color="emerald">Created</StyledBadge>;
		case "updated":
		case "update":
			return <StyledBadge color="blue">Updated</StyledBadge>;
		case "deleted":
		case "delete":
			return <StyledBadge color="red">Deleted</StyledBadge>;
		case "registered":
		case "register":
			return <StyledBadge color="purple">Registered</StyledBadge>;
		case "verified":
		case "verify":
			return <StyledBadge color="cyan">Verified</StyledBadge>;
		case "login":
			return <StyledBadge color="blue">Login</StyledBadge>;
		case "logout":
			return <StyledBadge color="gray">Logout</StyledBadge>;
		case "password_change":
		case "password_reset":
			return <StyledBadge color="yellow">Password</StyledBadge>;
		default:
			return <StyledBadge color="gray">{action}</StyledBadge>;
	}
};

// ============================================
// Audit Log Entity Type Badges
// ============================================
export const getAuditEntityBadge = (entityType: string) => {
	const typeMap: Record<string, string> = {
		user: "User",
		company: "Company",
		asset: "Asset",
		qrcode: "QR Code",
		verification: "Verification",
		session: "Session",
	};
	
	switch (entityType?.toLowerCase()) {
		case "user":
			return <StyledBadge color="blue">User</StyledBadge>;
		case "company":
			return <StyledBadge color="purple">Company</StyledBadge>;
		case "asset":
			return <StyledBadge color="orange">Asset</StyledBadge>;
		case "qrcode":
			return <StyledBadge color="cyan">QR Code</StyledBadge>;
		case "verification":
			return <StyledBadge color="emerald">Verification</StyledBadge>;
		case "session":
			return <StyledBadge color="gray">Session</StyledBadge>;
		default:
			return <StyledBadge color="gray">{typeMap[entityType] || entityType}</StyledBadge>;
	}
};

// ============================================
// Asset Status Badges
// ============================================
export const getAssetStatusBadge = (status: string) => {
	switch (status?.toLowerCase()) {
		case "active":
			return <StyledBadge color="emerald">Active</StyledBadge>;
		case "inactive":
			return <StyledBadge color="gray">Inactive</StyledBadge>;
		case "maintenance":
			return <StyledBadge color="yellow">Maintenance</StyledBadge>;
		case "retired":
			return <StyledBadge color="gray">Retired</StyledBadge>;
		case "transferred":
			return <StyledBadge color="blue">Transferred</StyledBadge>;
		default:
			return <StyledBadge color="gray">{status}</StyledBadge>;
	}
};

// ============================================
// Verification Status Badges
// ============================================
export const getVerificationStatusBadge = (status: string) => {
	switch (status?.toLowerCase()) {
		case "verified":
		case "success":
			return <StyledBadge color="emerald">Verified</StyledBadge>;
		case "failed":
		case "failure":
			return <StyledBadge color="red">Failed</StyledBadge>;
		case "pending":
			return <StyledBadge color="yellow">Pending</StyledBadge>;
		case "flagged":
			return <StyledBadge color="orange">Flagged</StyledBadge>;
		default:
			return <StyledBadge color="gray">{status}</StyledBadge>;
	}
};

// ============================================
// Sync Queue Status Badges
// ============================================
export const getSyncStatusBadge = (status: string) => {
	switch (status?.toLowerCase()) {
		case "pending":
			return <StyledBadge color="yellow">Pending</StyledBadge>;
		case "processing":
			return <StyledBadge color="blue">Processing</StyledBadge>;
		case "completed":
		case "success":
			return <StyledBadge color="emerald">Completed</StyledBadge>;
		case "failed":
		case "error":
			return <StyledBadge color="red">Failed</StyledBadge>;
		default:
			return <StyledBadge color="gray">{status}</StyledBadge>;
	}
};

// ============================================
// Generic/Reusable Badge
// ============================================
export { badgeStyles, type BadgeColor };
