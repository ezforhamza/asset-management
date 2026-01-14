import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ClipboardList, Eye, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import auditLogService, { type AuditLog } from "@/api/services/auditLogService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

const getActionBadge = (action: string) => {
	const actionMap: Record<string, { label: string; className: string }> = {
		created: { label: "Created", className: "bg-green-600" },
		registered: { label: "Registered", className: "bg-green-600" },
		updated: { label: "Updated", className: "text-blue-600 border-blue-600" },
		deleted: { label: "Deleted", className: "bg-destructive" },
		verified: { label: "Verified", className: "bg-purple-600" },
		status_changed: { label: "Status Changed", className: "text-orange-600 border-orange-600" },
	};

	const config = actionMap[action];
	if (config) {
		return (
			<Badge
				variant={action === "updated" || action === "status_changed" ? "outline" : "default"}
				className={config.className}
			>
				{config.label}
			</Badge>
		);
	}
	return <Badge variant="secondary">{action}</Badge>;
};

const getEntityBadge = (entityType: string) => {
	const typeMap: Record<string, string> = {
		asset: "Asset",
		user: "User",
		company: "Company",
		verification: "Verification",
		qr_code: "QR Code",
		qrCode: "QR Code",
	};
	return <Badge variant="secondary">{typeMap[entityType] || entityType}</Badge>;
};

export default function AdminAuditLogsPage() {
	const navigate = useNavigate();
	const [entityTypeFilter, setEntityTypeFilter] = useState<string | undefined>(undefined);
	const [actionFilter, setActionFilter] = useState<string | undefined>(undefined);
	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);
	const [limit] = useState(20);

	const { data, isLoading } = useQuery({
		queryKey: ["audit-logs", entityTypeFilter, actionFilter, searchQuery, page, limit],
		queryFn: () =>
			auditLogService.getAuditLogs({
				entityType: entityTypeFilter,
				action: actionFilter,
				performedBy: searchQuery || undefined,
				sortBy: "timestamp:desc",
				page,
				limit,
			}),
	});

	const logs = data?.results || [];

	const handleClearFilters = () => {
		setEntityTypeFilter(undefined);
		setActionFilter(undefined);
		setSearchQuery("");
		setPage(1);
	};

	const handleViewDetails = (log: AuditLog) => {
		navigate(`/admin/audit-logs/${log.id}`, { state: { log } });
	};

	const getSummary = (log: AuditLog) => {
		const changes = log.changes;
		if (!changes) return "—";
		if (!changes.before && changes.after) {
			const after = changes.after;
			if (after.serialNumber) return `Asset ${after.serialNumber} registered`;
			if (after.name) return `${after.name} created`;
			return "New record created";
		}
		if (changes.before && changes.after) {
			const changedFields = Object.keys(changes.after).filter(
				(key) => JSON.stringify(changes.before[key]) !== JSON.stringify(changes.after[key]),
			);
			return `${changedFields.length} field(s) updated`;
		}
		return "—";
	};

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
				<div className="relative w-64">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search by user name..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Select
					value={entityTypeFilter || "all"}
					onValueChange={(value) => setEntityTypeFilter(value === "all" ? undefined : value)}
				>
					<SelectTrigger className="w-[160px]">
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
				<Select
					value={actionFilter || "all"}
					onValueChange={(value) => setActionFilter(value === "all" ? undefined : value)}
				>
					<SelectTrigger className="w-[160px]">
						<SelectValue placeholder="Action" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Actions</SelectItem>
						<SelectItem value="created">Created</SelectItem>
						<SelectItem value="registered">Registered</SelectItem>
						<SelectItem value="updated">Updated</SelectItem>
						<SelectItem value="deleted">Deleted</SelectItem>
						<SelectItem value="verified">Verified</SelectItem>
					</SelectContent>
				</Select>
				{(entityTypeFilter || actionFilter || searchQuery) && (
					<Button variant="outline" size="sm" onClick={handleClearFilters}>
						Clear Filters
					</Button>
				)}
				<div className="flex-1" />
				<p className="text-sm text-muted-foreground">
					Showing {logs.length} of {data?.totalResults || 0} logs
				</p>
			</div>

			{/* Table */}
			<div className="flex-1 overflow-auto px-6 py-4">
				<div className="rounded-md border flex flex-col" style={{ height: "calc(100vh - 280px)" }}>
					<div className="flex-1 overflow-auto">
						{isLoading ? (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[180px]">Timestamp</TableHead>
										<TableHead className="w-[200px]">Entity</TableHead>
										<TableHead className="w-[120px]">Action</TableHead>
										<TableHead className="w-[200px]">Performed By</TableHead>
										<TableHead>Summary</TableHead>
										<TableHead className="w-[100px]">Actions</TableHead>
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
											<TableCell>
												<Skeleton className="h-8 w-8" />
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
										<TableHead className="w-[180px]">Timestamp</TableHead>
										<TableHead className="w-[200px]">Entity</TableHead>
										<TableHead className="w-[120px]">Action</TableHead>
										<TableHead className="w-[200px]">Performed By</TableHead>
										<TableHead>Summary</TableHead>
										<TableHead className="w-[100px]">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{logs.map((log) => (
										<TableRow
											key={log.id}
											className="cursor-pointer hover:bg-muted/50"
											onClick={() => handleViewDetails(log)}
										>
											<TableCell className="text-sm">
												<div>
													<p className="font-medium">{format(new Date(log.timestamp), "MMM d, yyyy")}</p>
													<p className="text-xs text-muted-foreground">{format(new Date(log.timestamp), "HH:mm:ss")}</p>
												</div>
											</TableCell>
											<TableCell>
												<div className="space-y-1">
													{getEntityBadge(log.entityType)}
													<p className="text-xs text-muted-foreground font-mono">{log.entityId.slice(0, 12)}...</p>
												</div>
											</TableCell>
											<TableCell>{getActionBadge(log.action)}</TableCell>
											<TableCell className="text-sm">
												<div>
													<p className="font-medium truncate">{log.performedBy.name}</p>
													<p className="text-xs text-muted-foreground truncate">{log.performedBy.email}</p>
												</div>
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">{getSummary(log)}</TableCell>
											<TableCell>
												<Button
													variant="ghost"
													size="sm"
													onClick={(e) => {
														e.stopPropagation();
														handleViewDetails(log);
													}}
												>
													<Eye className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</div>
					{data && data.totalPages > 1 && (
						<div className="flex items-center justify-between px-4 py-3 border-t">
							<div className="text-sm text-muted-foreground">
								Showing {(data.page - 1) * data.limit + 1} to {Math.min(data.page * data.limit, data.totalResults)} of{" "}
								{data.totalResults} results
							</div>
							<div className="flex items-center gap-2">
								<Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
									Previous
								</Button>
								<span className="text-sm">
									Page {data.page} of {data.totalPages}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(page + 1)}
									disabled={page === data.totalPages}
								>
									Next
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
