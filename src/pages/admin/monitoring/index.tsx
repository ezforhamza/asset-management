import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, Clock, Database, RefreshCw, Zap } from "lucide-react";
import adminService from "@/api/services/adminService";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";
import { FlaggedVerificationsTable } from "./components/FlaggedVerificationsTable";
import { SyncQueueTable } from "./components/SyncQueueTable";

export default function AdminMonitoringPage() {
	const {
		data: stats,
		isLoading: statsLoading,
		refetch,
	} = useQuery({
		queryKey: ["admin", "monitoring"],
		queryFn: adminService.getMonitoringStats,
		refetchInterval: 30000, // Refresh every 30 seconds
	});

	const { data: syncQueue, isLoading: queueLoading } = useQuery({
		queryKey: ["admin", "sync-queue"],
		queryFn: () => adminService.getSyncQueue({ limit: 10 }),
	});

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
							<Activity className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h1 className="text-xl font-semibold">System Monitoring</h1>
							<p className="text-sm text-muted-foreground">Monitor system health and sync status</p>
						</div>
					</div>
					<Button variant="outline" onClick={() => refetch()}>
						<RefreshCw className="h-4 w-4 mr-2" />
						Refresh
					</Button>
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto p-6 space-y-6">
				{/* Stats Cards */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Queued Uploads</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							{statsLoading ? (
								<Skeleton className="h-8 w-16" />
							) : (
								<div className="text-2xl font-bold">{stats?.queuedUploads ?? 0}</div>
							)}
							<p className="text-xs text-muted-foreground">Pending sync</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Failed Syncs</CardTitle>
							<AlertTriangle className="h-4 w-4 text-destructive" />
						</CardHeader>
						<CardContent>
							{statsLoading ? (
								<Skeleton className="h-8 w-16" />
							) : (
								<div className="text-2xl font-bold text-destructive">{stats?.failedSyncs ?? 0}</div>
							)}
							<p className="text-xs text-muted-foreground">Require attention</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Flagged Items</CardTitle>
							<AlertTriangle className="h-4 w-4 text-orange-500" />
						</CardHeader>
						<CardContent>
							{statsLoading ? (
								<Skeleton className="h-8 w-16" />
							) : (
								<div className="text-2xl font-bold text-orange-500">{stats?.flaggedVerifications ?? 0}</div>
							)}
							<p className="text-xs text-muted-foreground">Under investigation</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">API Response</CardTitle>
							<Zap className="h-4 w-4 text-green-500" />
						</CardHeader>
						<CardContent>
							{statsLoading ? (
								<Skeleton className="h-8 w-16" />
							) : (
								<div className="text-2xl font-bold">{stats?.apiResponseTime ?? 0}ms</div>
							)}
							<p className="text-xs text-muted-foreground">Average time</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">DB Connections</CardTitle>
							<Database className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							{statsLoading ? (
								<Skeleton className="h-8 w-16" />
							) : (
								<div className="text-2xl font-bold">{stats?.dbConnections ?? 0}</div>
							)}
							<p className="text-xs text-muted-foreground">Active connections</p>
						</CardContent>
					</Card>
				</div>

				{/* Tables Grid */}
				<div className="grid gap-6 lg:grid-cols-2">
					{/* Sync Queue */}
					<Card>
						<CardHeader>
							<CardTitle>Sync Queue</CardTitle>
							<CardDescription>Pending and failed sync items</CardDescription>
						</CardHeader>
						<CardContent>
							<SyncQueueTable items={syncQueue?.items || []} isLoading={queueLoading} />
						</CardContent>
					</Card>

					{/* Flagged Verifications */}
					<Card>
						<CardHeader>
							<CardTitle>Flagged Verifications</CardTitle>
							<CardDescription>Verifications requiring investigation</CardDescription>
						</CardHeader>
						<CardContent>
							<FlaggedVerificationsTable />
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
