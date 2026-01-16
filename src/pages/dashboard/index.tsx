import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle, Clock, Package } from "lucide-react";

import dashboardService from "@/api/services/dashboardService";
import { useUserInfo } from "@/store/userStore";
import { RecentActivity } from "./components/RecentActivity";
import { StatsCard } from "./components/StatsCard";

export default function DashboardPage() {
	const userInfo = useUserInfo();

	const { data: response, isLoading: statsLoading } = useQuery({
		queryKey: ["dashboard", "stats"],
		queryFn: dashboardService.getStats,
	});

	const { data: activityResponse, isLoading: activityLoading } = useQuery({
		queryKey: ["dashboard", "recent-activity"],
		queryFn: () => dashboardService.getRecentActivity(10),
	});

	const stats = response?.stats;

	// Transform API response to match RecentActivity component expectations
	// Filter: Only include verifications where asset exists AND has a valid QR code
	// Reverse the array to show most recent first (API returns oldest first)
	const recentActivity = ((activityResponse as any)?.results ?? [])
		.filter((item: any) => item.assetId != null && item.assetId.qrCodeId != null)
		.slice()
		.reverse()
		.map((item: any) => ({
			_id: item.id,
			assetSerialNumber: item.assetId?.serialNumber || "N/A",
			assetMake: item.assetId?.make || "N/A",
			assetModel: item.assetId?.model || "N/A",
			verifiedBy: item.verifiedBy?.name || "N/A",
			verifiedAt: item.verifiedAt,
			status: "on_time", // Default to on_time since these are recent verifications
			distance: item.distanceFromAsset || 0,
		}));

	return (
		<div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-5 border-b bg-card/80 backdrop-blur-sm">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
						<p className="text-sm text-muted-foreground mt-0.5">
							Welcome back,{" "}
							<span className="font-medium text-foreground">{userInfo.name || userInfo.email || "User"}</span>
						</p>
					</div>
					<div className="text-right text-xs text-muted-foreground">
						<p>Last updated</p>
						<p className="font-medium">{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
					</div>
				</div>
			</div>

			{/* Content - Scrollable */}
			<div className="flex-1 overflow-y-auto p-6 space-y-8">
				{/* Stats Grid */}
				<section>
					<h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Overview</h2>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<StatsCard
							title="Total Assets"
							value={statsLoading ? "-" : (stats?.assets.total ?? 0)}
							icon={Package}
							variant="default"
						/>
						<StatsCard
							title="Verified This Month"
							value={statsLoading ? "-" : (stats?.verificationStatus.onTime ?? 0)}
							icon={CheckCircle}
							variant="success"
						/>
						<StatsCard
							title="Due Soon"
							value={statsLoading ? "-" : (stats?.verificationStatus.dueSoon ?? 0)}
							subtitle="Within 7 days"
							icon={Clock}
							variant="warning"
						/>
						<StatsCard
							title="Overdue"
							value={statsLoading ? "-" : (stats?.verificationStatus.overdue ?? 0)}
							subtitle="Requires attention"
							icon={AlertTriangle}
							variant="danger"
						/>
					</div>
				</section>

				{/* Recent Activity */}
				<section>
					<h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Recent Activity</h2>
					<RecentActivity data={recentActivity} isLoading={activityLoading} />
				</section>
			</div>
		</div>
	);
}
