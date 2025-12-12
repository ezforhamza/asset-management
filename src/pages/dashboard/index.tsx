import { useQuery } from "@tanstack/react-query";
import { Package, CheckCircle, Clock, AlertTriangle } from "lucide-react";

import dashboardService from "@/api/services/dashboardService";
import { useUserInfo } from "@/store/userStore";
import { RecentActivity } from "./components/RecentActivity";
import { StatsCard } from "./components/StatsCard";

export default function DashboardPage() {
	const userInfo = useUserInfo();

	const { data: stats, isLoading: statsLoading } = useQuery({
		queryKey: ["dashboard", "stats"],
		queryFn: dashboardService.getStats,
	});

	const { data: recentActivity, isLoading: activityLoading } = useQuery({
		queryKey: ["dashboard", "recent-activity"],
		queryFn: () => dashboardService.getRecentActivity(10),
	});

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
				<h1 className="text-xl font-semibold">Dashboard</h1>
				<p className="text-sm text-muted-foreground">Welcome back, {userInfo.name || userInfo.email || "User"}</p>
			</div>

			{/* Content - Scrollable */}
			<div className="flex-1 overflow-y-auto p-6 space-y-6">
				{/* Stats Grid */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<StatsCard
						title="Total Assets"
						value={statsLoading ? "-" : (stats?.totalAssets ?? 0)}
						icon={Package}
						variant="default"
					/>
					<StatsCard
						title="Verified This Month"
						value={statsLoading ? "-" : (stats?.verifiedThisMonth ?? 0)}
						subtitle={stats?.verifiedPercentage ? `${stats.verifiedPercentage}% of total` : undefined}
						icon={CheckCircle}
						variant="success"
					/>
					<StatsCard
						title="Due Soon"
						value={statsLoading ? "-" : (stats?.dueSoon ?? 0)}
						subtitle="Within 7 days"
						icon={Clock}
						variant="warning"
					/>
					<StatsCard
						title="Overdue"
						value={statsLoading ? "-" : (stats?.overdue ?? 0)}
						subtitle="Requires attention"
						icon={AlertTriangle}
						variant="danger"
					/>
				</div>

				{/* Recent Activity */}
				<RecentActivity data={recentActivity ?? []} isLoading={activityLoading} />
			</div>
		</div>
	);
}
