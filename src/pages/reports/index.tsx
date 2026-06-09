import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	AlertCircle,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	CircleDot,
	Settings,
	ThumbsUp,
	Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useNavigate } from "react-router";
import type { VerificationReportItem } from "#/report";
import assetCategoryService from "@/api/services/assetCategoryService";
import reportService from "@/api/services/reportService";
import { Button } from "@/ui/button";
import { ExportButtons } from "./components/ExportButtons";
import { ReportFilters } from "./components/ReportFilters";
import { ReportTable } from "./components/ReportTable";

export default function ReportsPage() {
	const navigate = useNavigate();

	// Filter state
	const [dateRange, setDateRange] = useState<DateRange | undefined>();
	const [status, setStatus] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [gpsFilter, setGpsFilter] = useState("all");
	const [conditionFilter, setConditionFilter] = useState("all");
	const [operationalFilter, setOperationalFilter] = useState("all");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [page, setPage] = useState(1);
	const limit = 500;

	// Fetch categories for filter
	const { data: categoriesData } = useQuery({
		queryKey: ["asset-categories"],
		queryFn: () => assetCategoryService.getCategories({ limit: 100 }),
	});

	// Build query params — page/search are client-side only; API always loads full batch
	const queryParams = useMemo(() => {
		const params: Record<string, string | number | boolean> = { page: 1, limit };

		if (status !== "all") params.status = status;
		if (gpsFilter !== "all") params.gpsCheckPassed = gpsFilter === "true";
		if (conditionFilter !== "all") params.condition = conditionFilter;
		if (operationalFilter !== "all") params.operationalStatus = operationalFilter;
		if (categoryFilter !== "all") params.categoryId = categoryFilter;

		return params;
	}, [status, gpsFilter, conditionFilter, operationalFilter, categoryFilter]);

	// Fetch verifications
	const { data, isLoading } = useQuery({
		queryKey: ["reports", "verifications", queryParams],
		queryFn: () => reportService.getVerificationReport(queryParams),
	});

	// Client-side filtering (search + date range by nextVerificationDue)
	const filteredData = useMemo(() => {
		if (!data) return [];
		const dataResults = data.results;
		if (!dataResults) return [];

		let results = [...dataResults];

		// Filter by date range (nextVerificationDue)
		if (dateRange?.from || dateRange?.to) {
			results = results.filter((v: VerificationReportItem) => {
				if (!v.nextVerificationDue) return false;
				const nextDue = new Date(v.nextVerificationDue);
				// Set time to start/end of day for accurate comparison
				if (dateRange.from) {
					const fromDate = new Date(dateRange.from);
					fromDate.setHours(0, 0, 0, 0);
					if (nextDue < fromDate) return false;
				}
				if (dateRange.to) {
					const toDate = new Date(dateRange.to);
					toDate.setHours(23, 59, 59, 999);
					if (nextDue > toDate) return false;
				}
				return true;
			});
		}

		// Filter by search query
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			results = results.filter((v: VerificationReportItem) => {
				return (
					v.serialNumber?.toLowerCase().includes(query) ||
					v.make?.toLowerCase().includes(query) ||
					v.model?.toLowerCase().includes(query) ||
					v.makeModel?.toLowerCase().includes(query) ||
					v.siteName?.toLowerCase().includes(query) ||
					v.assetCategory?.name?.toLowerCase().includes(query) ||
					v.verifiedBy?.name?.toLowerCase().includes(query) ||
					v.registeredBy?.name?.toLowerCase().includes(query)
				);
			});
		}

		return results;
	}, [data, searchQuery, dateRange]);

	const handleViewDetails = (verification: VerificationReportItem) => {
		// Navigate to Asset History page - highlight latest verification
		navigate(`/customer-portal/assets/${verification.assetId}/history`, {
			state: { fromReports: true, highlightLatest: true },
		});
	};

	const handleClearFilters = () => {
		setDateRange(undefined);
		setStatus("all");
		setSearchQuery("");
		setGpsFilter("all");
		setConditionFilter("all");
		setOperationalFilter("all");
		setCategoryFilter("all");
		setPage(1);
	};

	const totalPages = Math.max(1, Math.ceil(filteredData.length / 20));
	const effectivePage = Math.min(page, totalPages);
	const pageData = filteredData.slice((effectivePage - 1) * 20, effectivePage * 20);
	const fleetSummary = data?.fleetSummary;

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header: title + stats + export — all one compact row */}
			<div className="flex-shrink-0 px-6 py-3 border-b bg-card/50">
				<div className="flex items-center justify-between gap-4 flex-wrap">
					<div>
						<h1 className="text-xl font-semibold">Reports</h1>
						<p className="text-xs text-muted-foreground">View and export verification reports</p>
					</div>

					{/* Fleet Summary inline */}
					{fleetSummary && (
						<div className="flex items-center gap-4 flex-wrap text-sm">
							<span className="text-xs font-medium text-muted-foreground">Condition:</span>
							<span className="flex items-center gap-1">
								<ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />
								<strong>{fleetSummary.condition.good}</strong> Good
							</span>
							<span className="flex items-center gap-1">
								<CircleDot className="h-3.5 w-3.5 text-orange-500" />
								<strong>{fleetSummary.condition.fair}</strong> Fair
							</span>
							<span className="flex items-center gap-1">
								<AlertCircle className="h-3.5 w-3.5 text-red-500" />
								<strong>{fleetSummary.condition.poor}</strong> Poor
							</span>
							<span className="w-px h-4 bg-border" />
							<span className="text-xs font-medium text-muted-foreground">Operational:</span>
							<span className="flex items-center gap-1">
								<CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
								<strong>{fleetSummary.operationalStatus.operational}</strong> Operational
							</span>
							<span className="flex items-center gap-1">
								<Wrench className="h-3.5 w-3.5 text-orange-500" />
								<strong>{fleetSummary.operationalStatus.needsRepair}</strong> Needs Repair
							</span>
							<span className="flex items-center gap-1">
								<Settings className="h-3.5 w-3.5 text-red-500" />
								<strong>{fleetSummary.operationalStatus.nonOperational}</strong> Non-Operational
							</span>
						</div>
					)}

					<ExportButtons
						startDate={dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined}
						endDate={dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined}
						status={status}
					/>
				</div>
			</div>

			{/* Filters — compact single row, no labels */}
			<div className="flex-shrink-0 px-6 py-2 border-b">
				<ReportFilters
					dateRange={dateRange}
					setDateRange={setDateRange}
					status={status}
					setStatus={setStatus}
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					gpsFilter={gpsFilter}
					setGpsFilter={setGpsFilter}
					conditionFilter={conditionFilter}
					setConditionFilter={setConditionFilter}
					operationalFilter={operationalFilter}
					setOperationalFilter={setOperationalFilter}
					categoryFilter={categoryFilter}
					setCategoryFilter={setCategoryFilter}
					categories={categoriesData?.results || []}
					onClearFilters={handleClearFilters}
					compact
				/>
			</div>

			{/* Count + Pagination */}
			<div className="flex-shrink-0 flex items-center justify-between px-6 py-1.5 bg-muted/30">
				<p className="text-xs text-muted-foreground">
					{isLoading ? "Loading..." : `Showing ${filteredData.length} of ${data?.totalResults || 0} verifications`}
				</p>
				{totalPages > 1 && (
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setPage(Math.max(1, effectivePage - 1))}
							disabled={effectivePage === 1}
							className="h-7 w-7 p-0"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<span className="text-xs text-muted-foreground px-1">
							{effectivePage} / {totalPages}
						</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setPage(Math.min(totalPages, effectivePage + 1))}
							disabled={effectivePage === totalPages}
							className="h-7 w-7 p-0"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				)}
			</div>

			{/* Table */}
			<div className="flex-1 min-h-0 overflow-hidden px-6 py-3">
				<ReportTable
					data={pageData}
					isLoading={isLoading}
					onViewDetails={handleViewDetails}
					page={effectivePage}
					totalPages={totalPages}
					onPageChange={setPage}
				/>
			</div>
		</div>
	);
}
