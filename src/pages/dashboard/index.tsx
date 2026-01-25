import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle, ClipboardCheck, Clock, MapPin, Package, Wrench } from "lucide-react";

import dashboardService from "@/api/services/dashboardService";
import { useUserInfo } from "@/store/userStore";
import { DetailedStatsCard } from "./components/DetailedStatsCard";
import { RecentActivity } from "./components/RecentActivity";
import { StatsCard } from "./components/StatsCard";

export default function DashboardPage() {
	const userInfo = useUserInfo();

	const { data: response, isLoading: statsLoading } = useQuery({
		queryKey: ["dashboard", "stats"],
		queryFn: dashboardService.getStats,
	});

	const { data: activityResponse, isLoading: activityLoading } = useQuery({
		queryKey: ["dashboard", "recent-activities"],
		queryFn: () => dashboardService.getRecentActivities(10),
	});

	const stats = response?.stats;
	const recentActivities = activityResponse?.results ?? [];

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
						{/* Card 1: Total Assets */}
						<StatsCard
							title="Total Assets"
							value={statsLoading ? "-" : (stats?.assets.total ?? 0)}
							icon={Package}
							variant="default"
						/>
						{/* Card 2: Asset Status */}
						<DetailedStatsCard
							title="Asset Status"
							icon={CheckCircle}
							variant="success"
							items={
								statsLoading
									? []
									: [
											{
												label: "Verified",
												value:
													(stats?.verificationStatus.onTime ?? 0) +
													(stats?.verificationStatus.dueSoon ?? 0) +
													(stats?.verificationStatus.overdue ?? 0),
												icon: CheckCircle,
												iconColor: "text-emerald-500",
											},
											{
												label: "Registered",
												value: stats?.verificationStatus.registered ?? 0,
												icon: Package,
												iconColor: "text-blue-500",
											},
											{
												label: "Unregistered",
												value: stats?.verificationStatus.unregistered ?? 0,
												icon: Package,
												iconColor: "text-muted-foreground",
											},
										]
							}
						/>
						{/* Card 3: Needs Attention */}
						<DetailedStatsCard
							title="Needs Attention"
							icon={AlertTriangle}
							variant="warning"
							items={
								statsLoading
									? []
									: [
											{
												label: "Due Soon",
												value: stats?.verificationStatus.dueSoon ?? 0,
												icon: Clock,
												iconColor: "text-orange-500",
											},
											{
												label: "Overdue",
												value: stats?.verificationStatus.overdue ?? 0,
												icon: AlertTriangle,
												iconColor: "text-red-500",
											},
										]
							}
						/>
						{/* Card 4: Activity Summary */}
						<DetailedStatsCard
							title="Activity Summary"
							icon={ClipboardCheck}
							variant="default"
							items={
								statsLoading
									? []
									: [
											{
												label: "Total Verifications",
												value: stats?.activity.totalVerifications ?? 0,
												icon: ClipboardCheck,
												iconColor: "text-primary",
											},
											{
												label: "GPS Overrides",
												value: stats?.activity.gpsOverrides ?? 0,
												icon: MapPin,
												iconColor: "text-blue-500",
											},
											{
												label: "Repairs Needed",
												value: stats?.activity.repairsNeeded ?? 0,
												icon: Wrench,
												iconColor: "text-orange-500",
											},
										]
							}
						/>
					</div>
				</section>

				{/* Recent Activity */}
				<section>
					<h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Recent Activity</h2>
					<RecentActivity data={recentActivities} isLoading={activityLoading} />
				</section>
			</div>
		</div>
	);
}
