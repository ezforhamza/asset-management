import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Building2, Package, QrCode, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router";
import dashboardService from "@/api/services/dashboardService";
import { Card, CardContent } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";

export default function AdminDashboardPage() {
	const navigate = useNavigate();

	const { data: dashboardData, isLoading } = useQuery({
		queryKey: ["dashboard"],
		queryFn: dashboardService.getDashboardData,
	});

	const stats = dashboardData?.stats;
	const recentCompanies = dashboardData?.recentCompanies || [];

	return (
		<div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-5 border-b bg-card/80 backdrop-blur-sm">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
							<Shield className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
							<p className="text-sm text-muted-foreground">System overview and key metrics</p>
						</div>
					</div>
					<div className="text-right text-xs text-muted-foreground">
						<p>Last updated</p>
						<p className="font-medium">{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto p-6 space-y-8">
				{/* Stats Cards */}
				<section>
					<h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Overview</h2>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card
							className="cursor-pointer hover:shadow-md hover:border-blue-500/20 transition-all duration-200 relative overflow-hidden"
							onClick={() => navigate("/admin/companies")}
						>
							<div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-50" />
							<CardContent className="p-6 relative">
								<div className="flex items-start justify-between">
									<div className="space-y-1">
										<p className="text-sm font-medium text-muted-foreground">Total Companies</p>
										{isLoading ? (
											<Skeleton className="h-8 w-20" />
										) : (
											<>
												<h3 className="text-3xl font-bold tracking-tight">{stats?.totalCompanies ?? 0}</h3>
												<p className="text-xs text-muted-foreground mt-1">Registered companies</p>
											</>
										)}
									</div>
									<div className="rounded-xl p-3 shadow-sm bg-blue-500/10 text-blue-600">
										<Building2 className="h-6 w-6" />
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="hover:shadow-md hover:border-emerald-500/20 transition-all duration-200 relative overflow-hidden">
							<div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-50" />
							<CardContent className="p-6 relative">
								<div className="flex items-start justify-between">
									<div className="space-y-1">
										<p className="text-sm font-medium text-muted-foreground">Total Users</p>
										{isLoading ? (
											<Skeleton className="h-8 w-20" />
										) : (
											<>
												<h3 className="text-3xl font-bold tracking-tight">{stats?.totalUsers ?? 0}</h3>
												<p className="text-xs text-muted-foreground mt-1">Across all companies</p>
											</>
										)}
									</div>
									<div className="rounded-xl p-3 shadow-sm bg-emerald-500/10 text-emerald-600">
										<Users className="h-6 w-6" />
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="hover:shadow-md hover:border-orange-500/20 transition-all duration-200 relative overflow-hidden">
							<div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-50" />
							<CardContent className="p-6 relative">
								<div className="flex items-start justify-between">
									<div className="space-y-1">
										<p className="text-sm font-medium text-muted-foreground">Total Assets</p>
										{isLoading ? (
											<Skeleton className="h-8 w-20" />
										) : (
											<>
												<h3 className="text-3xl font-bold tracking-tight">{stats?.totalAssets ?? 0}</h3>
												<p className="text-xs text-muted-foreground mt-1">Registered assets</p>
											</>
										)}
									</div>
									<div className="rounded-xl p-3 shadow-sm bg-orange-500/10 text-orange-600">
										<Package className="h-6 w-6" />
									</div>
								</div>
							</CardContent>
						</Card>

						<Card
							className="cursor-pointer hover:shadow-md hover:border-purple-500/20 transition-all duration-200 relative overflow-hidden"
							onClick={() => navigate("/admin/qr-inventory")}
						>
							<div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-50" />
							<CardContent className="p-6 relative">
								<div className="flex items-start justify-between">
									<div className="space-y-1">
										<p className="text-sm font-medium text-muted-foreground">Total QR Codes</p>
										{isLoading ? (
											<Skeleton className="h-8 w-20" />
										) : (
											<>
												<h3 className="text-3xl font-bold tracking-tight">{stats?.totalQRCodes ?? 0}</h3>
												<p className="text-xs text-muted-foreground mt-1">In inventory</p>
											</>
										)}
									</div>
									<div className="rounded-xl p-3 shadow-sm bg-purple-500/10 text-purple-600">
										<QrCode className="h-6 w-6" />
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</section>

				{/* Recent Companies */}
				<section>
					<h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Recent Companies</h2>
					<Card className="border shadow-sm">
						<CardContent className="p-0">
							<div className="max-h-[380px] overflow-y-auto">
								{isLoading ? (
									<div className="space-y-3">
										{Array.from({ length: 5 }).map((_, i) => (
											<div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
												<div className="flex items-center gap-3 flex-1">
													<Skeleton className="h-8 w-8 rounded-lg" />
													<div className="space-y-2 flex-1">
														<Skeleton className="h-4 w-32" />
														<Skeleton className="h-3 w-48" />
													</div>
												</div>
												<Skeleton className="h-4 w-8" />
											</div>
										))}
									</div>
								) : recentCompanies.length === 0 ? (
									<p className="text-sm text-muted-foreground text-center py-8">No companies yet</p>
								) : (
									<div className="space-y-3">
										{recentCompanies.map((company, index) => (
											<div
												key={company._id}
												className={`flex items-center justify-between p-4 hover:bg-primary/5 cursor-pointer transition-colors ${
													index !== recentCompanies.length - 1 ? "border-b border-border/50" : ""
												}`}
												onClick={() => navigate(`/admin/companies/${company._id}`)}
											>
												<div className="flex items-center gap-3 flex-1">
													<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
														<Building2 className="h-5 w-5 text-primary" />
													</div>
													<div className="flex-1 min-w-0">
														<p className="font-medium text-sm truncate">{company.companyName}</p>
														<p className="text-xs text-muted-foreground truncate">{company.contactEmail}</p>
													</div>
												</div>
												<div className="flex items-center gap-4">
													<div className="flex items-center gap-1.5 text-sm">
														<Users className="h-4 w-4 text-muted-foreground" />
														<span className="font-medium">{company.totalUsers}</span>
													</div>
													<span className="text-xs text-muted-foreground">
														{format(new Date(company.createdAt), "MMM d, yyyy")}
													</span>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</section>
			</div>
		</div>
	);
}
