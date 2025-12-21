import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Building2, Package, QrCode, Shield, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router";
import dashboardService from "@/api/services/dashboardService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
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
									<p className="text-xs text-muted-foreground flex items-center gap-1">
										<TrendingUp className="h-3 w-3" />
										Registered companies
									</p>
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
							<CardTitle className="text-sm font-medium">Total QR Codes</CardTitle>
							<QrCode className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<Skeleton className="h-8 w-20" />
							) : (
								<>
									<div className="text-2xl font-bold">{stats?.totalQRCodes ?? 0}</div>
									<p className="text-xs text-muted-foreground">In inventory</p>
								</>
							)}
						</CardContent>
					</Card>
				</div>

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
								{recentCompanies.map((company) => (
									<div
										key={company._id}
										className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
										onClick={() => navigate(`/admin/companies/${company._id}`)}
									>
										<div className="flex items-center gap-3 flex-1">
											<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
												<Building2 className="h-5 w-5 text-primary" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="font-medium text-sm truncate">{company.companyName}</p>
												<p className="text-xs text-muted-foreground truncate">{company.contactEmail}</p>
												<p className="text-xs text-muted-foreground mt-1">
													Registered {format(new Date(company.createdAt), "MMM d, yyyy")}
												</p>
											</div>
										</div>
										<div className="flex flex-col items-end gap-1">
											<div className="flex items-center gap-1 text-xs text-muted-foreground">
												<Users className="h-3 w-3" />
												<span className="font-medium">{company.totalUsers}</span>
											</div>
											<span className="text-xs text-muted-foreground">users</span>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
