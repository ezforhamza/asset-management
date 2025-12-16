import { formatDistanceToNow } from "date-fns";
import { AlertCircle, CheckCircle, Clock, Loader2, RefreshCw } from "lucide-react";
import type { SyncQueueItem } from "#/entity";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

interface SyncQueueTableProps {
	items: SyncQueueItem[];
	isLoading: boolean;
	onRetry?: (item: SyncQueueItem) => void;
}

const getStatusIcon = (status: string) => {
	switch (status) {
		case "pending":
			return <Clock className="h-4 w-4 text-blue-500" />;
		case "processing":
			return <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />;
		case "completed":
			return <CheckCircle className="h-4 w-4 text-green-500" />;
		case "failed":
			return <AlertCircle className="h-4 w-4 text-destructive" />;
		default:
			return <Clock className="h-4 w-4 text-muted-foreground" />;
	}
};

const getStatusBadge = (status: string) => {
	switch (status) {
		case "pending":
			return (
				<Badge variant="outline" className="text-blue-600 border-blue-600">
					Pending
				</Badge>
			);
		case "processing":
			return (
				<Badge variant="outline" className="text-orange-600 border-orange-600">
					Processing
				</Badge>
			);
		case "completed":
			return (
				<Badge variant="default" className="bg-green-600">
					Completed
				</Badge>
			);
		case "failed":
			return <Badge variant="destructive">Failed</Badge>;
		default:
			return <Badge variant="secondary">{status}</Badge>;
	}
};

export function SyncQueueTable({ items, isLoading, onRetry }: SyncQueueTableProps) {
	if (isLoading) {
		return (
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Type</TableHead>
						<TableHead>User</TableHead>
						<TableHead>Asset</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Attempts</TableHead>
						<TableHead>Created</TableHead>
						<TableHead className="w-[80px]" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 3 }).map((_, i) => (
						<TableRow key={i}>
							<TableCell>
								<Skeleton className="h-5 w-24" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-5 w-28" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-5 w-32" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-5 w-20" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-5 w-12" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-5 w-24" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-8 w-16" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		);
	}

	if (items.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-center">
				<CheckCircle className="h-10 w-10 text-green-500 mb-3" />
				<h3 className="text-lg font-medium">All synced!</h3>
				<p className="text-sm text-muted-foreground">No pending items in the queue.</p>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Type</TableHead>
					<TableHead>User</TableHead>
					<TableHead>Asset</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Attempts</TableHead>
					<TableHead>Created</TableHead>
					<TableHead className="w-[80px]" />
				</TableRow>
			</TableHeader>
			<TableBody>
				{items.map((item) => (
					<TableRow key={item._id}>
						<TableCell>
							<div className="flex items-center gap-2">
								{getStatusIcon(item.syncStatus)}
								<span className="capitalize text-sm">{item.queueData.type}</span>
							</div>
						</TableCell>
						<TableCell className="text-sm">{item.userName || item.userId}</TableCell>
						<TableCell className="text-sm font-mono">
							{item.queueData.serialNumber || item.queueData.assetId || "—"}
						</TableCell>
						<TableCell>{getStatusBadge(item.syncStatus)}</TableCell>
						<TableCell className="text-sm text-center">{item.attempts}</TableCell>
						<TableCell className="text-sm text-muted-foreground">
							{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
						</TableCell>
						<TableCell>
							{item.syncStatus === "failed" && (
								<Button variant="ghost" size="sm" onClick={() => onRetry?.(item)}>
									<RefreshCw className="h-4 w-4 mr-1" />
									Retry
								</Button>
							)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
