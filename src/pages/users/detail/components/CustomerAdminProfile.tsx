import { Building2, CheckCircle2, KeyRound, Mail, Shield, ShieldCheck, Smartphone, User, XCircle } from "lucide-react";
import type { UserInfo } from "#/entity";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";

interface CustomerAdminProfileProps {
	user: UserInfo;
}

export function CustomerAdminProfile({ user }: CustomerAdminProfileProps) {
	const getAdminTypeBadge = (adminType: string | null | undefined) => {
		if (adminType === "full") {
			return (
				<Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
					<ShieldCheck className="h-3 w-3 mr-1" />
					Full Admin
				</Badge>
			);
		}
		if (adminType === "read_only") {
			return (
				<Badge variant="secondary">
					<Shield className="h-3 w-3 mr-1" />
					Read-Only
				</Badge>
			);
		}
		return null;
	};

	const getStatusBadge = (status: string | undefined) => {
		if (status === "active") {
			return (
				<Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
					<CheckCircle2 className="h-3 w-3 mr-1" />
					Active
				</Badge>
			);
		}
		return (
			<Badge variant="destructive">
				<XCircle className="h-3 w-3 mr-1" />
				Inactive
			</Badge>
		);
	};

	const getBooleanBadge = (value: boolean | undefined, trueText: string, falseText: string) => {
		if (value) {
			return (
				<Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
					<CheckCircle2 className="h-3 w-3 mr-1" />
					{trueText}
				</Badge>
			);
		}
		return (
			<Badge variant="secondary">
				<XCircle className="h-3 w-3 mr-1" />
				{falseText}
			</Badge>
		);
	};

	return (
		<div className="space-y-6">
			{/* Profile Section */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Profile Information
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-6">
						<Avatar className="h-24 w-24">
							<AvatarImage src={user.profilePic || undefined} alt={user.name} />
							<AvatarFallback className="text-2xl">{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
						</Avatar>
						<div className="space-y-2">
							<h2 className="text-2xl font-semibold">{user.name}</h2>
							<div className="flex items-center gap-2 text-muted-foreground">
								<Mail className="h-4 w-4" />
								<span>{user.email}</span>
							</div>
							<div className="flex items-center gap-2">
								<Badge variant="outline">
									<Shield className="h-3 w-3 mr-1" />
									Customer Admin
								</Badge>
								{getAdminTypeBadge(user.adminType)}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Account Details Section */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ShieldCheck className="h-5 w-5" />
						Account Details
					</CardTitle>
					<CardDescription>Account status and security settings</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{/* Role */}
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">Role</p>
							<Badge variant="outline">
								<Shield className="h-3 w-3 mr-1" />
								Customer Admin
							</Badge>
						</div>

						{/* Admin Type */}
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">Admin Type</p>
							{getAdminTypeBadge(user.adminType) || <span className="text-sm text-muted-foreground">—</span>}
						</div>

						{/* Is Default Admin */}
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">Default Admin</p>
							{getBooleanBadge(user.isDefaultAdmin, "Yes", "No")}
						</div>

						{/* Account Status */}
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">Account Status</p>
							{getStatusBadge(user.status)}
						</div>

						{/* Email Verified */}
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">Email Verified</p>
							{getBooleanBadge(user.isEmailVerified, "Verified", "Not Verified")}
						</div>

						{/* MFA Enabled */}
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">MFA Enabled</p>
							{getBooleanBadge(user.mfaEnabled, "Enabled", "Disabled")}
						</div>

						{/* Must Change Password */}
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">Password Status</p>
							{user.mustChangePassword ? (
								<Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
									<KeyRound className="h-3 w-3 mr-1" />
									Must Change
								</Badge>
							) : (
								<Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
									<CheckCircle2 className="h-3 w-3 mr-1" />
									Set
								</Badge>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* System Info Section */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Building2 className="h-5 w-5" />
						System Information
					</CardTitle>
					<CardDescription>Technical details and identifiers</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Device Platform */}
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">Device Platform</p>
							<div className="flex items-center gap-2">
								<Smartphone className="h-4 w-4 text-muted-foreground" />
								<span className="font-medium">{user.devicePlatform || "Not specified"}</span>
							</div>
						</div>

						{/* Company ID */}
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">Company ID</p>
							<div className="flex items-center gap-2">
								<Building2 className="h-4 w-4 text-muted-foreground" />
								<code className="text-sm bg-muted px-2 py-1 rounded">{user.companyId || "—"}</code>
							</div>
						</div>

						{/* User ID */}
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">User ID</p>
							<code className="text-sm bg-muted px-2 py-1 rounded">{user.id}</code>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default CustomerAdminProfile;
