import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, ClipboardList, Eye, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useNavigate } from "react-router";
import auditLogService, { type AuditLog } from "@/api/services/auditLogService";
import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import { Input } from "@/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { cn } from "@/utils";
import { getAuditActionBadge, getAuditEntityBadge } from "@/utils/badge-styles";
import { formatLabel } from "@/utils/formatLabel";

export default function AdminAuditLogsPage() {
	const navigate = useNavigate();
	const [entityTypeFilter, setEntityTypeFilter] = useState<string | undefined>(undefined);
	const [actionFilter, setActionFilter] = useState<string | undefined>(undefined);
	const [searchQuery, setSearchQuery] = useState("");
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
	const [page, setPage] = useState(1);
	const [limit] = useState(20);

	const { data, isLoading } = useQuery({
		queryKey: ["audit-logs", entityTypeFilter, actionFilter, dateRange, page, limit],
		queryFn: () =>
			auditLogService.getAuditLogs({
				entityType: entityTypeFilter,
				action: actionFilter,
				// Note: performedBy requires MongoDB ID, so we filter by name client-side
				startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
				endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
				sortBy: "timestamp:desc",
				page,
				limit: 100, // Fetch more to allow client-side filtering
			}),
	});

	// Client-side filtering by user name (since backend requires MongoDB ID for performedBy)
	const logs = useMemo(() => {
		const allLogs = data?.results || [];
		if (!searchQuery.trim()) return allLogs;

		const query = searchQuery.toLowerCase().trim();
		return allLogs.filter((log) => {
			const userName = log.performedBy?.name?.toLowerCase() || "";
			const userEmail = log.performedBy?.email?.toLowerCase() || "";
			return userName.includes(query) || userEmail.includes(query);
		});
	}, [data?.results, searchQuery]);

	const handleClearFilters = () => {
		setEntityTypeFilter(undefined);
		setActionFilter(undefined);
		setSearchQuery("");
		setDateRange(undefined);
		setPage(1);
	};

	const handleViewDetails = (log: AuditLog) => {
		navigate(`/admin/audit-logs/${log.id}`, { state: { log } });
	};

	// Generate meaningful summary based on entity type and action
	const getSummary = (log: AuditLog) => {
		const { entityType, action, changes, metadata } = log;
		const entity = formatLabel(entityType);
		const entityCapitalized = entity;

		// Get identifier from changes or metadata
		const getIdentifier = () => {
			const data = changes?.after || changes?.before || metadata;
			if (!data) return null;
			return data.serialNumber || data.qrCode || data.name || data.companyName || data.email || null;
		};

		const identifier = getIdentifier();
		const identifierText = identifier ? ` "${identifier}"` : "";

		// Action-specific summaries
		switch (action) {
			case "registered":
				if (entityType === "asset") {
					return `Asset${identifierText} registered with QR code`;
				}
				return `${entityCapitalized}${identifierText} registered`;

			case "deleted":
				return `${entityCapitalized}${identifierText} was deleted`;

			case "verified":
				if (entityType === "asset" || entityType === "verification") {
					const status = changes?.after?.status || metadata?.status;
					if (status) {
						return `Asset${identifierText} verified as ${status}`;
					}
					return `Asset${identifierText} verification completed`;
				}
				return `${entityCapitalized} verified`;

			case "created":
				return `${entityCapitalized}${identifierText} was created`;

			case "updated":
				if (changes?.before && changes?.after) {
					const changedFields = Object.keys(changes.after).filter(
						(key) => !key.startsWith("_") && JSON.stringify(changes.before[key]) !== JSON.stringify(changes.after[key]),
					);
					if (changedFields.length > 0) {
						const fieldNames = changedFields.slice(0, 2).join(", ");
						const moreText = changedFields.length > 2 ? ` +${changedFields.length - 2} more` : "";
						return `${entityCapitalized} updated: ${fieldNames}${moreText}`;
					}
				}
				return `${entityCapitalized}${identifierText} was updated`;

			case "allocated":
				if (entityType === "qr_code" || entityType === "qrCode") {
					return `QR code${identifierText} allocated to company`;
				}
				return `${entityCapitalized} allocated`;

			case "retired":
				return `${entityCapitalized}${identifierText} was retired`;

			case "repair_requested":
				return `Repair requested for asset${identifierText}`;

			case "movement_created":
				return `Movement created for asset${identifierText}`;

			default:
				return `${entityCapitalized} ${action}`;
		}
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
						<SelectItem value="repair_requested">Repair Requested</SelectItem>
						<SelectItem value="movement_created">Movement Created</SelectItem>
					</SelectContent>
				</Select>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn("w-[260px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{dateRange?.from ? (
								dateRange.to ? (
									<>
										{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
									</>
								) : (
									format(dateRange.from, "LLL dd, y")
								)
							) : (
								<span>Pick a date range</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="range"
							defaultMonth={dateRange?.from}
							selected={dateRange}
							onSelect={setDateRange}
							numberOfMonths={2}
						/>
					</PopoverContent>
				</Popover>
				{dateRange && (
					<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDateRange(undefined)}>
						<X className="h-4 w-4" />
					</Button>
				)}
				{(entityTypeFilter || actionFilter || searchQuery || dateRange) && (
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
													{getAuditEntityBadge(log.entityType)}
													<p className="text-xs text-muted-foreground font-mono">{log.entityId.slice(0, 12)}...</p>
												</div>
											</TableCell>
											<TableCell>{getAuditActionBadge(log.action)}</TableCell>
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
