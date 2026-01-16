import { formatDistanceToNow } from "date-fns";
import type { RecentActivity as RecentActivityType } from "#/entity";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";
import { StatusBadge } from "./StatusBadge";

interface RecentActivityProps {
	data: RecentActivityType[];
	isLoading?: boolean;
}

export function RecentActivity({ data, isLoading }: RecentActivityProps) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Recent Verifications</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="flex items-center gap-4">
								<Skeleton className="h-10 w-10 rounded-full" />
								<div className="space-y-2 flex-1">
									<Skeleton className="h-4 w-[200px]" />
									<Skeleton className="h-3 w-[150px]" />
								</div>
								<Skeleton className="h-6 w-[80px]" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!data || data.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Recent Verifications</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<p className="text-muted-foreground">No recent verifications</p>
						<p className="text-sm text-muted-foreground mt-1">
							Verifications will appear here once field workers start scanning assets
						</p>
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
						<div className="grid grid-cols-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							<div>Asset</div>
							<div>Verified By</div>
							<div>Distance</div>
							<div>Status</div>
							<div className="text-right">Time</div>
						</div>
					</div>
					{/* Scrollable Body */}
					<div className="flex-1 overflow-y-auto">
						{data.map((item, index) => (
							<div
								key={item._id}
								className={`grid grid-cols-5 py-3.5 px-6 items-center hover:bg-primary/5 transition-colors cursor-pointer ${
									index !== data.length - 1 ? "border-b border-border/50" : ""
								}`}
							>
								<div>
									<p className="font-medium text-sm">{item.assetSerialNumber}</p>
									<p className="text-xs text-muted-foreground">
										{item.assetMake} {item.assetModel}
									</p>
								</div>
								<div className="text-sm">{item.verifiedBy}</div>
								<div className="text-sm font-mono">{item.distance.toFixed(1)}m</div>
								<div>
									<StatusBadge status={item.status} />
								</div>
								<div className="text-right text-sm text-muted-foreground">
									{formatDistanceToNow(new Date(item.verifiedAt), { addSuffix: true })}
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
