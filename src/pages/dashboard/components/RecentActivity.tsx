import { formatDistanceToNow } from "date-fns";
import { ClipboardCheck, Package } from "lucide-react";
import type { RecentActivityItem } from "@/api/services/dashboardService";
import { Badge } from "@/ui/badge";
import { Card, CardContent } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";

interface RecentActivityProps {
	data: RecentActivityItem[];
	isLoading?: boolean;
}

const getActivityTypeBadge = (activityType: "registration" | "verification") => {
	if (activityType === "registration") {
		return (
			<Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">
				<Package className="h-3 w-3 mr-1" />
				Registration
			</Badge>
		);
	}
	return (
		<Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
			<ClipboardCheck className="h-3 w-3 mr-1" />
			Verification
		</Badge>
	);
};

export function RecentActivity({ data, isLoading }: RecentActivityProps) {
	if (isLoading) {
		return (
			<Card className="flex flex-col h-[420px] border shadow-sm">
				<CardContent className="flex-1 overflow-hidden p-0">
					<div className="h-full flex flex-col">
						<div className="flex-shrink-0 border-b bg-muted/30 px-6">
							<div className="grid grid-cols-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								<div>Asset</div>
								<div>Performed By</div>
								<div>Type</div>
								<div className="text-right">Time</div>
							</div>
						</div>
						<div className="flex-1 overflow-y-auto p-6 space-y-4">
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={`skeleton-${i}`} className="flex items-center gap-4">
									<Skeleton className="h-10 w-10 rounded-full" />
									<div className="space-y-2 flex-1">
										<Skeleton className="h-4 w-[200px]" />
										<Skeleton className="h-3 w-[150px]" />
									</div>
									<Skeleton className="h-6 w-[80px]" />
								</div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!data || data.length === 0) {
		return (
			<Card className="flex flex-col h-[420px] border shadow-sm">
				<CardContent className="flex-1 overflow-hidden p-0">
					<div className="h-full flex flex-col">
						<div className="flex-shrink-0 border-b bg-muted/30 px-6">
							<div className="grid grid-cols-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								<div>Asset</div>
								<div>Performed By</div>
								<div>Type</div>
								<div className="text-right">Time</div>
							</div>
						</div>
						<div className="flex flex-col items-center justify-center flex-1 py-8 text-center">
							<p className="text-muted-foreground">No recent activity</p>
							<p className="text-sm text-muted-foreground mt-1">
								Activity will appear here once field workers start registering or verifying assets
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="flex flex-col h-[420px] border shadow-sm">
			<CardContent className="flex-1 overflow-hidden p-0">
				<div className="h-full flex flex-col">
					{/* Fixed Header */}
					<div className="flex-shrink-0 border-b bg-muted/30 px-6">
						<div className="grid grid-cols-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							<div>Asset</div>
							<div>Performed By</div>
							<div>Type</div>
							<div className="text-right">Time</div>
						</div>
					</div>
					{/* Scrollable Body */}
					<div className="flex-1 overflow-y-auto">
						{data.map((item, index) => (
							<div
								key={item._id}
								className={`grid grid-cols-4 py-3.5 px-6 items-center hover:bg-primary/5 transition-colors cursor-pointer ${
									index !== data.length - 1 ? "border-b border-border/50" : ""
								}`}
							>
								<div>
									<p className="font-medium text-sm">{item.asset?.serialNumber || "N/A"}</p>
									<p className="text-xs text-muted-foreground">
										{item.asset?.make || ""} {item.asset?.model || ""}
									</p>
								</div>
								<div className="text-sm">{item.performedBy?.name || "N/A"}</div>
								<div>{getActivityTypeBadge(item.activityType)}</div>
								<div className="text-right text-sm text-muted-foreground">
									{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
								</div>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default RecentActivity;
