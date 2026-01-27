import { format } from "date-fns";
import { X } from "lucide-react";
import type { AuditLog } from "@/api/services/auditLogService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import { ScrollArea } from "@/ui/scroll-area";
import { getAuditActionBadge, StyledBadge } from "@/utils/badge-styles";
import { formatLabel } from "@/utils/formatLabel";

interface AuditLogDetailModalProps {
	log: AuditLog | null;
	open: boolean;
	onClose: () => void;
}

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

const renderValue = (value: any): string => {
	if (value === null || value === undefined) return "—";
	if (typeof value === "boolean") return value ? "Yes" : "No";
	if (typeof value === "object") {
		if (Array.isArray(value)) return `[${value.length} items]`;
		if (value.type === "Point" && value.coordinates) {
			return `${value.coordinates[1]}, ${value.coordinates[0]}`;
		}
		return JSON.stringify(value, null, 2);
	}
	return String(value);
};

const renderChanges = (changes: any, entityType: string) => {
	if (!changes) return null;

	const { before, after } = changes;

	if (!before && after) {
		// Creation - show all fields
		return (
			<div className="space-y-3">
				<p className="text-sm font-medium text-green-600">New Record Created</p>
				<div className="grid grid-cols-1 gap-2">
					{Object.entries(after).map(([key, value]) => {
						if (key.startsWith("_") || key === "__v") return null;
						return (
							<div
								key={key}
								className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900"
							>
								<p className="text-xs font-medium text-muted-foreground mb-1">{getFieldLabel(entityType, key)}</p>
								<p className="text-sm font-mono break-all">{renderValue(value)}</p>
							</div>
						);
					})}
				</div>
			</div>
		);
	}

	if (before && after) {
		// Update - show differences
		const changedFields = Object.keys(after).filter((key) => {
			if (key.startsWith("_") || key === "__v") return false;
			return JSON.stringify(before[key]) !== JSON.stringify(after[key]);
		});

		if (changedFields.length === 0) {
			return <p className="text-sm text-muted-foreground">No changes detected</p>;
		}

		return (
			<div className="space-y-3">
				<p className="text-sm font-medium text-blue-600">{changedFields.length} Field(s) Updated</p>
				<div className="grid grid-cols-1 gap-3">
					{changedFields.map((key) => (
						<div key={key} className="p-3 rounded-lg bg-muted/50 border">
							<p className="text-xs font-medium text-muted-foreground mb-2">{getFieldLabel(entityType, key)}</p>
							<div className="grid grid-cols-2 gap-2">
								<div className="p-2 rounded bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
									<p className="text-xs text-red-600 dark:text-red-400 mb-1">Before</p>
									<p className="text-sm font-mono break-all">{renderValue(before[key])}</p>
								</div>
								<div className="p-2 rounded bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
									<p className="text-xs text-green-600 dark:text-green-400 mb-1">After</p>
									<p className="text-sm font-mono break-all">{renderValue(after[key])}</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return null;
};

export function AuditLogDetailModal({ log, open, onClose }: AuditLogDetailModalProps) {
	if (!log) return null;

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh]">
				<DialogHeader>
					<div className="flex items-center justify-between">
						<DialogTitle className="flex items-center gap-3">
							<span>Audit Log Details</span>
							{getAuditActionBadge(log.action)}
						</DialogTitle>
						<Button variant="ghost" size="icon" onClick={onClose}>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</DialogHeader>

				<ScrollArea className="max-h-[calc(90vh-120px)]">
					<div className="space-y-6 pr-4">
						{/* Overview */}
						<div className="grid grid-cols-2 gap-4">
							<div className="p-4 rounded-lg bg-muted/50">
								<p className="text-xs text-muted-foreground mb-1">Timestamp</p>
								<p className="text-sm font-medium">{format(new Date(log.timestamp), "PPpp")}</p>
							</div>
							<div className="p-4 rounded-lg bg-muted/50">
								<p className="text-xs text-muted-foreground mb-1">Entity Type</p>
								<p className="text-sm font-medium capitalize">{log.entityType}</p>
							</div>
							<div className="p-4 rounded-lg bg-muted/50">
								<p className="text-xs text-muted-foreground mb-1">Entity ID</p>
								<p className="text-sm font-mono">{log.entityId}</p>
							</div>
							<div className="p-4 rounded-lg bg-muted/50">
								<p className="text-xs text-muted-foreground mb-1">Action</p>
								<p className="text-sm font-medium capitalize">{log.action}</p>
							</div>
						</div>

						{/* Performed By */}
						<div className="p-4 rounded-lg border bg-card">
							<p className="text-sm font-medium mb-3">Performed By</p>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-xs text-muted-foreground mb-1">Name</p>
									<p className="text-sm font-medium">{log.performedBy.name}</p>
								</div>
								<div>
									<p className="text-xs text-muted-foreground mb-1">Email</p>
									<p className="text-sm">{log.performedBy.email}</p>
								</div>
								<div>
									<p className="text-xs text-muted-foreground mb-1">Role</p>
									<StyledBadge color="gray">{formatLabel(log.performedBy.role)}</StyledBadge>
								</div>
								<div>
									<p className="text-xs text-muted-foreground mb-1">User ID</p>
									<p className="text-sm font-mono">{log.performedBy.id}</p>
								</div>
							</div>
						</div>

						{/* Metadata */}
						{log.metadata && Object.keys(log.metadata).length > 0 && (
							<div className="p-4 rounded-lg border bg-card">
								<p className="text-sm font-medium mb-3">Metadata</p>
								<div className="grid grid-cols-2 gap-3">
									{Object.entries(log.metadata).map(([key, value]) => (
										<div key={key}>
											<p className="text-xs text-muted-foreground mb-1">{key}</p>
											<p className="text-sm font-mono">{renderValue(value)}</p>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Technical Details */}
						{(log.ipAddress || log.userAgent) && (
							<div className="p-4 rounded-lg border bg-card">
								<p className="text-sm font-medium mb-3">Technical Details</p>
								<div className="space-y-2">
									{log.ipAddress && (
										<div>
											<p className="text-xs text-muted-foreground mb-1">IP Address</p>
											<p className="text-sm font-mono">{log.ipAddress}</p>
										</div>
									)}
									{log.userAgent && (
										<div>
											<p className="text-xs text-muted-foreground mb-1">User Agent</p>
											<p className="text-sm font-mono text-wrap break-all">{log.userAgent}</p>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Changes */}
						<div className="p-4 rounded-lg border bg-card">
							<p className="text-sm font-medium mb-4">Changes</p>
							{renderChanges(log.changes, log.entityType)}
						</div>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
