import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Download, Plus, Search, Wrench, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { RepairRequest } from "@/api/services/repairRequestService";
import repairRequestService, { type RepairRequestsListParams } from "@/api/services/repairRequestService";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { ExportModal } from "./components/ExportModal";
import { LogRepairRequestModal } from "./components/LogRepairRequestModal";
import { RepairRequestDetailModal } from "./components/RepairRequestDetailModal";
import { RepairRequestTable } from "./components/RepairRequestTable";

const today = new Date().toISOString().slice(0, 10);
const firstOfMonth = `${today.slice(0, 7)}-01`;

export default function RepairRequestsPage() {
	const [page, setPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [sourceFilter, setSourceFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [startDate, setStartDate] = useState(firstOfMonth);
	const [endDate, setEndDate] = useState(today);
	const [logModalOpen, setLogModalOpen] = useState(false);
	const [exportModalOpen, setExportModalOpen] = useState(false);
	const [detailRequest, setDetailRequest] = useState<RepairRequest | null>(null);

	useEffect(() => {
		const t = setTimeout(() => {
			setDebouncedSearch(searchQuery);
			setPage(1);
		}, 300);
		return () => clearTimeout(t);
	}, [searchQuery]);

	const queryParams: RepairRequestsListParams = useMemo(() => {
		const params: RepairRequestsListParams = { page, limit: 20, sortBy: "createdAt:desc" };
		if (debouncedSearch) params.search = debouncedSearch;
		if (sourceFilter) params.source = sourceFilter;
		if (statusFilter) params.status = statusFilter;
		if (startDate) params.startDate = startDate;
		if (endDate) params.endDate = endDate;
		return params;
	}, [page, debouncedSearch, sourceFilter, statusFilter, startDate, endDate]);

	const { data, isLoading } = useQuery({
		queryKey: ["repair-requests", queryParams],
		queryFn: () => repairRequestService.getRepairRequests(queryParams),
	});

	const requests = data?.results || [];
	const totalPages = data?.totalPages || 1;
	const totalResults = data?.totalResults || 0;

	const hasFilters = !!(sourceFilter || statusFilter);

	const clearFilters = () => {
		setSourceFilter("");
		setStatusFilter("");
		setPage(1);
	};

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
							<Wrench className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h1 className="text-xl font-semibold">Repair Requests</h1>
							<p className="text-sm text-muted-foreground">Track asset repair requests from field workers and admins</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" onClick={() => setExportModalOpen(true)}>
							<Download className="h-4 w-4 mr-2" />
							Export
						</Button>
						<Button onClick={() => setLogModalOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Log Repair Request
						</Button>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="flex-shrink-0 px-6 py-4 border-b">
				<div className="flex flex-wrap items-center gap-3">
					<div className="relative flex-1 min-w-[200px] max-w-xs">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search serial, make, model, site..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>

					<div className="flex items-center gap-2">
						<Input
							type="date"
							value={startDate}
							onChange={(e) => {
								setStartDate(e.target.value);
								setPage(1);
							}}
							className="w-[145px] text-sm"
						/>
						<span className="text-muted-foreground text-sm">to</span>
						<Input
							type="date"
							value={endDate}
							onChange={(e) => {
								setEndDate(e.target.value);
								setPage(1);
							}}
							className="w-[145px] text-sm"
						/>
					</div>

					<Select
						value={sourceFilter}
						onValueChange={(v) => {
							setSourceFilter(v);
							setPage(1);
						}}
					>
						<SelectTrigger className="w-[150px]">
							<SelectValue placeholder="Source" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="field_worker">Field Worker</SelectItem>
							<SelectItem value="customer_admin">Customer Admin</SelectItem>
						</SelectContent>
					</Select>

					<Select
						value={statusFilter}
						onValueChange={(v) => {
							setStatusFilter(v);
							setPage(1);
						}}
					>
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="open">Open</SelectItem>
							<SelectItem value="acknowledged">Acknowledged</SelectItem>
							<SelectItem value="resolved">Resolved</SelectItem>
						</SelectContent>
					</Select>

					{hasFilters && (
						<Button variant="ghost" size="sm" onClick={clearFilters}>
							<X className="h-4 w-4 mr-1" />
							Clear
						</Button>
					)}
				</div>
			</div>

			{/* Count */}
			<div className="flex-shrink-0 px-6 py-2 bg-muted/30">
				<p className="text-sm text-muted-foreground">
					{isLoading ? "Loading..." : `${totalResults} repair request${totalResults !== 1 ? "s" : ""}`}
				</p>
			</div>

			{/* Table */}
			<div className="flex-1 min-h-0 overflow-hidden px-6 py-4">
				<div className="rounded-md border flex flex-col h-full overflow-hidden">
					<div className="flex-1 min-h-0 overflow-auto">
						<RepairRequestTable requests={requests} isLoading={isLoading} onView={setDetailRequest} />
					</div>

					{/* Pagination */}
					<div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-t bg-muted/30">
						<p className="text-sm text-muted-foreground">
							Page {page} of {totalPages || 1}
						</p>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page === 1}
							>
								<ChevronLeft className="h-4 w-4 mr-1" />
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								disabled={page >= totalPages}
							>
								Next
								<ChevronRight className="h-4 w-4 ml-1" />
							</Button>
						</div>
					</div>
				</div>
			</div>

			<LogRepairRequestModal open={logModalOpen} onClose={() => setLogModalOpen(false)} />
			<ExportModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} />
			<RepairRequestDetailModal request={detailRequest} open={!!detailRequest} onClose={() => setDetailRequest(null)} />
		</div>
	);
}
