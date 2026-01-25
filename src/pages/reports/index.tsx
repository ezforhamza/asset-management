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
	const limit = 20;

	// Fetch categories for filter
	const { data: categoriesData } = useQuery({
		queryKey: ["asset-categories"],
		queryFn: () => assetCategoryService.getCategories({ limit: 100 }),
	});

	// Build query params - date range filtering is done client-side for nextVerificationDue
	const queryParams = useMemo(() => {
		const params: Record<string, string | number | boolean> = { page, limit };

		if (status !== "all") {
			params.status = status;
		}
		if (gpsFilter !== "all") {
			params.gpsCheckPassed = gpsFilter === "true";
		}
		if (conditionFilter !== "all") {
			params.condition = conditionFilter;
		}
		if (operationalFilter !== "all") {
			params.operationalStatus = operationalFilter;
		}
		if (categoryFilter !== "all") {
			params.categoryId = categoryFilter;
		}

		return params;
	}, [status, gpsFilter, conditionFilter, operationalFilter, categoryFilter, page]);

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
					v.makeModel?.toLowerCase().includes(query)
				);
			});
		}

		return results;
	}, [data, searchQuery, dateRange]);

	const handleViewDetails = (verification: VerificationReportItem) => {
		// Navigate to Asset History page - highlight latest verification
		navigate(`/assets/${verification.assetId}/history`, {
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

	const totalPages = data?.totalPages || 1;
	const fleetSummary = data?.fleetSummary;

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="text-xl font-semibold">Reports</h1>
						<p className="text-sm text-muted-foreground">View and export verification reports</p>
					</div>
					<ExportButtons
						startDate={dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined}
						endDate={dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined}
						status={status}
					/>
				</div>

				{/* Fleet Summary */}
				{fleetSummary && (
					<div className="mt-4 flex flex-wrap items-center gap-6">
						{/* Condition Summary */}
						<div className="flex items-center gap-4">
							<span className="text-sm font-medium text-muted-foreground">Condition:</span>
							<div className="flex items-center gap-2">
								<ThumbsUp className="h-4 w-4 text-emerald-500" />
								<span className="text-sm">
									<strong>{fleetSummary.condition.good}</strong> Good
								</span>
							</div>
							<div className="flex items-center gap-2">
								<CircleDot className="h-4 w-4 text-orange-500" />
								<span className="text-sm">
									<strong>{fleetSummary.condition.fair}</strong> Fair
								</span>
							</div>
							<div className="flex items-center gap-2">
								<AlertCircle className="h-4 w-4 text-red-500" />
								<span className="text-sm">
									<strong>{fleetSummary.condition.poor}</strong> Poor
								</span>
							</div>
						</div>

						<div className="h-4 w-px bg-border" />

						{/* Operational Status Summary */}
						<div className="flex items-center gap-4">
							<span className="text-sm font-medium text-muted-foreground">Operational:</span>
							<div className="flex items-center gap-2">
								<CheckCircle className="h-4 w-4 text-emerald-500" />
								<span className="text-sm">
									<strong>{fleetSummary.operationalStatus.operational}</strong> Operational
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Wrench className="h-4 w-4 text-orange-500" />
								<span className="text-sm">
									<strong>{fleetSummary.operationalStatus.needsRepair}</strong> Needs Repair
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Settings className="h-4 w-4 text-red-500" />
								<span className="text-sm">
									<strong>{fleetSummary.operationalStatus.nonOperational}</strong> Non-Operational
								</span>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Filters */}
			<div className="flex-shrink-0 px-6 py-4 border-b">
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
				/>
			</div>

			{/* Results count & Pagination */}
			<div className="flex-shrink-0 flex items-center justify-between px-6 py-2 bg-muted/30">
				<p className="text-sm text-muted-foreground">
					{isLoading ? "Loading..." : `Showing ${filteredData.length} of ${data?.totalResults || 0} verifications`}
				</p>
				{totalPages > 1 && (
					<div className="flex items-center gap-2">
						<Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<span className="text-sm text-muted-foreground">
							{page} / {totalPages}
						</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							disabled={page === totalPages}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				)}
			</div>

			{/* Table - Scrollable area with max height */}
			<div className="flex-1 min-h-0 overflow-hidden px-6 py-4">
				<ReportTable
					data={filteredData}
					isLoading={isLoading}
					onViewDetails={handleViewDetails}
					page={page}
					totalPages={totalPages}
					onPageChange={setPage}
				/>
			</div>
		</div>
	);
}
