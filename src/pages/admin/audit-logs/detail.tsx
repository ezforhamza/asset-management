import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, Code, FileText, Info, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import type { AuditLog } from "@/api/services/auditLogService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Separator } from "@/ui/separator";

const getActionBadge = (action: string) => {
	const actionMap: Record<string, { label: string; className: string }> = {
		created: { label: "Created", className: "bg-green-600" },
		registered: { label: "Registered", className: "bg-green-600" },
		updated: { label: "Updated", className: "text-blue-600 border-blue-600" },
		deleted: { label: "Deleted", className: "bg-destructive" },
		verified: { label: "Verified", className: "bg-purple-600" },
		status_changed: { label: "Status Changed", className: "text-orange-600 border-orange-600" },
	};

	const config = actionMap[action];
	if (config) {
		return (
			<Badge
				variant={action === "updated" || action === "status_changed" ? "outline" : "default"}
				className={config.className}
			>
				{config.label}
			</Badge>
		);
	}
	return <Badge variant="secondary">{action}</Badge>;
};

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
		return (
			<div className="space-y-3">
				<p className="text-sm font-medium text-green-600">New Record Created</p>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{Object.entries(after).map(([key, value]) => {
						if (key.startsWith("_") || key === "__v") return null;
						return (
							<div
								key={key}
								className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900"
							>
								<p className="text-xs font-medium text-muted-foreground mb-2">{getFieldLabel(entityType, key)}</p>
								<p className="text-sm font-mono break-all">{renderValue(value)}</p>
							</div>
						);
					})}
				</div>
			</div>
		);
	}

	if (before && after) {
		const changedFields = Object.keys(after).filter((key) => {
			if (key.startsWith("_") || key === "__v") return false;
			return JSON.stringify(before[key]) !== JSON.stringify(after[key]);
		});

		if (changedFields.length === 0) {
			return <p className="text-sm text-muted-foreground">No changes detected</p>;
		}

		return (
			<div className="space-y-4">
				<p className="text-sm font-medium text-blue-600">{changedFields.length} Field(s) Updated</p>
				<div className="grid grid-cols-1 gap-4">
					{changedFields.map((key) => (
						<div key={key} className="p-4 rounded-lg bg-muted/50 border">
							<p className="text-sm font-medium text-foreground mb-3">{getFieldLabel(entityType, key)}</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								<div className="p-3 rounded bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
									<p className="text-xs text-red-600 dark:text-red-400 font-medium mb-2">Before</p>
									<p className="text-sm font-mono break-all">{renderValue(before[key])}</p>
								</div>
								<div className="p-3 rounded bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
									<p className="text-xs text-green-600 dark:text-green-400 font-medium mb-2">After</p>
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
						{getActionBadge(log.action)}
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
										<FileText className="h-5 w-5 text-primary" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-xs text-muted-foreground">Entity Type</p>
										<p className="text-sm font-medium capitalize truncate">{log.entityType}</p>
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
								{/* Changes Section */}
								<div className="rounded-lg border bg-card">
									<div className="p-6 border-b">
										<div className="flex items-center gap-2">
											<Code className="h-5 w-5 text-primary" />
											<h2 className="text-lg font-semibold">Changes</h2>
										</div>
									</div>
									<div className="p-6">{renderChanges(log.changes, log.entityType)}</div>
								</div>

								{/* Metadata Section */}
								{log.metadata && Object.keys(log.metadata).length > 0 && (
									<div className="rounded-lg border bg-card">
										<div className="p-6 border-b">
											<div className="flex items-center gap-2">
												<Info className="h-5 w-5 text-primary" />
												<h2 className="text-lg font-semibold">Metadata</h2>
											</div>
										</div>
										<div className="p-6">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{Object.entries(log.metadata).map(([key, value]) => (
													<div key={key} className="p-3 rounded-lg bg-muted/50">
														<p className="text-xs font-medium text-muted-foreground mb-1">{key}</p>
														<p className="text-sm font-mono break-all">{renderValue(value)}</p>
													</div>
												))}
											</div>
										</div>
									</div>
								)}
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
											<Badge variant="secondary" className="capitalize">
												{log.performedBy.role.replace("_", " ")}
											</Badge>
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
											<FileText className="h-5 w-5 text-primary" />
											<h2 className="text-lg font-semibold">Entity Info</h2>
										</div>
									</div>
									<div className="p-6 space-y-4">
										<div>
											<p className="text-xs font-medium text-muted-foreground mb-1">Entity Type</p>
											<Badge variant="secondary" className="capitalize">
												{log.entityType}
											</Badge>
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
								{(log.ipAddress || log.userAgent) && (
									<div className="rounded-lg border bg-card">
										<div className="p-6 border-b">
											<div className="flex items-center gap-2">
												<Code className="h-5 w-5 text-primary" />
												<h2 className="text-lg font-semibold">Technical</h2>
											</div>
										</div>
										<div className="p-6 space-y-4">
											{log.ipAddress && (
												<>
													<div>
														<p className="text-xs font-medium text-muted-foreground mb-1">IP Address</p>
														<p className="text-sm font-mono">{log.ipAddress}</p>
													</div>
													{log.userAgent && <Separator />}
												</>
											)}
											{log.userAgent && (
												<div>
													<p className="text-xs font-medium text-muted-foreground mb-1">User Agent</p>
													<p className="text-xs font-mono break-all text-muted-foreground">{log.userAgent}</p>
												</div>
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
