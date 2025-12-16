import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { ClipboardList } from "lucide-react";
import { useState } from "react";
import type { AuditLog } from "#/entity";
import adminService from "@/api/services/adminService";
import { Badge } from "@/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

const getActionBadge = (action: string) => {
	switch (action) {
		case "created":
			return (
				<Badge variant="default" className="bg-green-600">
					Created
				</Badge>
			);
		case "updated":
			return (
				<Badge variant="outline" className="text-blue-600 border-blue-600">
					Updated
				</Badge>
			);
		case "deleted":
			return <Badge variant="destructive">Deleted</Badge>;
		case "status_changed":
			return (
				<Badge variant="outline" className="text-orange-600 border-orange-600">
					Status Changed
				</Badge>
			);
		default:
			return <Badge variant="secondary">{action}</Badge>;
	}
};

const getEntityBadge = (entityType: string) => {
	switch (entityType) {
		case "asset":
			return <Badge variant="secondary">Asset</Badge>;
		case "user":
			return <Badge variant="secondary">User</Badge>;
		case "company":
			return <Badge variant="secondary">Company</Badge>;
		case "verification":
			return <Badge variant="secondary">Verification</Badge>;
		case "qr_code":
			return <Badge variant="secondary">QR Code</Badge>;
		default:
			return <Badge variant="secondary">{entityType}</Badge>;
	}
};

const DATE_RANGES = [
	{ label: "All Time", value: "all", days: null },
	{ label: "Last 7 days", value: "7d", days: 7 },
	{ label: "Last 30 days", value: "30d", days: 30 },
	{ label: "Last 90 days", value: "90d", days: 90 },
];

export default function AdminAuditLogsPage() {
	const [entityTypeFilter, setEntityTypeFilter] = useState("all");
	const [dateRange, setDateRange] = useState("all");

	const selectedRange = DATE_RANGES.find((r) => r.value === dateRange);
	const startDate = selectedRange?.days ? subDays(new Date(), selectedRange.days).toISOString() : undefined;

	const { data, isLoading } = useQuery({
		queryKey: ["admin", "audit-logs", entityTypeFilter, dateRange],
		queryFn: () =>
			adminService.getAuditLogs({
				entityType: entityTypeFilter !== "all" ? entityTypeFilter : undefined,
				startDate,
			}),
	});

	const logs = data?.logs || [];

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
						<ClipboardList className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h1 className="text-xl font-semibold">Audit Logs</h1>
						<p className="text-sm text-muted-foreground">Track all system changes and user actions</p>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="flex-shrink-0 px-6 py-4 border-b flex flex-wrap items-center gap-4">
				<Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Entity Type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Types</SelectItem>
						<SelectItem value="asset">Asset</SelectItem>
						<SelectItem value="user">User</SelectItem>
						<SelectItem value="company">Company</SelectItem>
						<SelectItem value="verification">Verification</SelectItem>
						<SelectItem value="qr_code">QR Code</SelectItem>
					</SelectContent>
				</Select>
				<Select value={dateRange} onValueChange={setDateRange}>
					<SelectTrigger className="w-[150px]">
						<SelectValue placeholder="Date Range" />
					</SelectTrigger>
					<SelectContent>
						{DATE_RANGES.map((range) => (
							<SelectItem key={range.value} value={range.value}>
								{range.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<div className="flex-1" />
				<p className="text-sm text-muted-foreground">
					Showing {logs.length} of {data?.pagination?.total || 0} logs
				</p>
			</div>

			{/* Table */}
			<div className="flex-1 overflow-hidden px-6 py-4">
				<div className="rounded-md border h-full overflow-auto">
					{isLoading ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Timestamp</TableHead>
									<TableHead>Entity</TableHead>
									<TableHead>Action</TableHead>
									<TableHead>Performed By</TableHead>
									<TableHead>Changes</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{Array.from({ length: 5 }).map((_, i) => (
									<TableRow key={i}>
										<TableCell>
											<Skeleton className="h-5 w-32" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-5 w-20" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-5 w-20" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-5 w-28" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-5 w-48" />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : logs.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-full text-center">
							<ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-4" />
							<h3 className="text-lg font-medium">No audit logs found</h3>
							<p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Timestamp</TableHead>
									<TableHead>Entity</TableHead>
									<TableHead>Action</TableHead>
									<TableHead>Performed By</TableHead>
									<TableHead>Changes</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{logs.map((log: AuditLog) => (
									<TableRow key={log._id}>
										<TableCell className="text-sm">{format(new Date(log.timestamp), "MMM d, yyyy HH:mm")}</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												{getEntityBadge(log.entityType)}
												<span className="text-xs text-muted-foreground font-mono">{log.entityId.slice(0, 8)}...</span>
											</div>
										</TableCell>
										<TableCell>{getActionBadge(log.action)}</TableCell>
										<TableCell className="text-sm">{log.performedByName || log.performedBy}</TableCell>
										<TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
											{Object.entries(log.changes).map(([key, value]) => (
												<span key={key}>
													{key}: {String(value.old)} → {String(value.new)}
												</span>
											))}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</div>
			</div>
		</div>
	);
}
