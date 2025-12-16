import { useQuery } from "@tanstack/react-query";
import { Activity, Building2, Package, QrCode, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router";
import adminService from "@/api/services/adminService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";

export default function AdminDashboardPage() {
	const navigate = useNavigate();

	const { data: stats, isLoading } = useQuery({
		queryKey: ["admin", "dashboard-stats"],
		queryFn: adminService.getAdminStats,
	});

	const { data: companiesData } = useQuery({
		queryKey: ["admin", "companies"],
		queryFn: () => adminService.getCompanies({ limit: 5 }),
	});

	const { data: monitoringData } = useQuery({
		queryKey: ["admin", "monitoring"],
		queryFn: adminService.getMonitoringStats,
	});

	const recentCompanies = companiesData?.companies?.slice(0, 5) || [];

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
						<Shield className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h1 className="text-xl font-semibold">Admin Dashboard</h1>
						<p className="text-sm text-muted-foreground">System overview and key metrics</p>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto p-6 space-y-6">
				{/* Stats Cards */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card
						className="cursor-pointer hover:shadow-md transition-shadow"
						onClick={() => navigate("/admin/companies")}
					>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Companies</CardTitle>
							<Building2 className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<Skeleton className="h-8 w-20" />
							) : (
								<>
									<div className="text-2xl font-bold">{stats?.totalCompanies ?? 0}</div>
									<p className="text-xs text-muted-foreground">{stats?.activeCompanies ?? 0} active</p>
								</>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Users</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<Skeleton className="h-8 w-20" />
							) : (
								<>
									<div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
									<p className="text-xs text-muted-foreground">Across all companies</p>
								</>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Assets</CardTitle>
							<Package className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<Skeleton className="h-8 w-20" />
							) : (
								<>
									<div className="text-2xl font-bold">{stats?.totalAssets ?? 0}</div>
									<p className="text-xs text-muted-foreground">Registered assets</p>
								</>
							)}
						</CardContent>
					</Card>

					<Card
						className="cursor-pointer hover:shadow-md transition-shadow"
						onClick={() => navigate("/admin/qr-inventory")}
					>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">QR Codes</CardTitle>
							<QrCode className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<Skeleton className="h-8 w-20" />
							) : (
								<>
									<div className="text-2xl font-bold">{stats?.totalQRCodes ?? 0}</div>
									<p className="text-xs text-muted-foreground">{stats?.availableQRCodes ?? 0} available</p>
								</>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Second Row */}
				<div className="grid gap-6 lg:grid-cols-2">
					{/* Recent Companies */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Building2 className="h-5 w-5" />
								Recent Companies
							</CardTitle>
							<CardDescription>Latest registered companies</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{recentCompanies.length === 0 ? (
									<p className="text-sm text-muted-foreground text-center py-4">No companies yet</p>
								) : (
									recentCompanies.map((company) => (
										<div
											key={company._id}
											className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
											onClick={() => navigate(`/admin/companies/${company._id}`)}
										>
											<div className="flex items-center gap-3">
												<div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
													<Building2 className="h-4 w-4 text-primary" />
												</div>
												<div>
													<p className="font-medium text-sm">{company.companyName}</p>
													<p className="text-xs text-muted-foreground">{company.contactEmail}</p>
												</div>
											</div>
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												<Users className="h-3 w-3" />
												{company.totalUsers ?? 0}
											</div>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>

					{/* System Health */}
					<Card
						className="cursor-pointer hover:shadow-md transition-shadow"
						onClick={() => navigate("/admin/monitoring")}
					>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Activity className="h-5 w-5" />
								System Health
							</CardTitle>
							<CardDescription>Quick monitoring overview</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-4">
								<div className="p-4 rounded-lg bg-muted/50">
									<p className="text-sm text-muted-foreground">Queued Uploads</p>
									<p className="text-2xl font-bold">{monitoringData?.queuedUploads ?? 0}</p>
								</div>
								<div className="p-4 rounded-lg bg-muted/50">
									<p className="text-sm text-muted-foreground">Failed Syncs</p>
									<p className="text-2xl font-bold text-destructive">{monitoringData?.failedSyncs ?? 0}</p>
								</div>
								<div className="p-4 rounded-lg bg-muted/50">
									<p className="text-sm text-muted-foreground">Flagged Items</p>
									<p className="text-2xl font-bold text-orange-500">{monitoringData?.flaggedVerifications ?? 0}</p>
								</div>
								<div className="p-4 rounded-lg bg-muted/50">
									<p className="text-sm text-muted-foreground">API Response</p>
									<p className="text-2xl font-bold text-green-500">{monitoringData?.apiResponseTime ?? 0}ms</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
