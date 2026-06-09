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
import { ExportButtons } from "@/pages/reports/components/ExportButtons";
import { ReportFilters } from "@/pages/reports/components/ReportFilters";
import { ReportTable } from "@/pages/reports/components/ReportTable";
import { Button } from "@/ui/button";
import { CompanyFilter } from "../components/CompanyFilter";

export default function SuperUserReportsPage() {
	const navigate = useNavigate();

	const [companyId, setCompanyId] = useState("all");
	const [dateRange, setDateRange] = useState<DateRange | undefined>();
	const [status, setStatus] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [gpsFilter, setGpsFilter] = useState("all");
	const [conditionFilter, setConditionFilter] = useState("all");
	const [operationalFilter, setOperationalFilter] = useState("all");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [page, setPage] = useState(1);
	const limit = 500;

	const { data: categoriesData } = useQuery({
		queryKey: ["asset-categories", companyId],
		queryFn: () => assetCategoryService.getCategories({ limit: 100 }),
	});

	// Build query params — search is purely client-side, does not trigger API refetch
	const queryParams = useMemo(() => {
		const params: Record<string, string | number | boolean> = { page, limit };
		if (companyId && companyId !== "all") params.companyId = companyId;
		if (status !== "all") params.status = status;
		if (gpsFilter !== "all") params.gpsCheckPassed = gpsFilter === "true";
		if (conditionFilter !== "all") params.condition = conditionFilter;
		if (operationalFilter !== "all") params.operationalStatus = operationalFilter;
		if (categoryFilter !== "all") params.categoryId = categoryFilter;
		return params;
	}, [status, gpsFilter, conditionFilter, operationalFilter, categoryFilter, page, companyId]);

	const { data, isLoading } = useQuery({
		queryKey: ["super-user", "reports", "verifications", queryParams],
		queryFn: () => reportService.getVerificationReport(queryParams),
	});

	const filteredData = useMemo(() => {
		if (!data?.results) return [];
		let results = [...data.results];

		if (dateRange?.from || dateRange?.to) {
			results = results.filter((v: VerificationReportItem) => {
				if (!v.nextVerificationDue) return false;
				const nextDue = new Date(v.nextVerificationDue);
				if (dateRange?.from) {
					const from = new Date(dateRange.from);
					from.setHours(0, 0, 0, 0);
					if (nextDue < from) return false;
				}
				if (dateRange?.to) {
					const to = new Date(dateRange.to);
					to.setHours(23, 59, 59, 999);
					if (nextDue > to) return false;
				}
				return true;
			});
		}

		if (searchQuery) {
			const q = searchQuery.toLowerCase();
			results = results.filter(
				(v: VerificationReportItem) =>
					v.serialNumber?.toLowerCase().includes(q) ||
					v.make?.toLowerCase().includes(q) ||
					v.model?.toLowerCase().includes(q) ||
					v.makeModel?.toLowerCase().includes(q) ||
					v.siteName?.toLowerCase().includes(q) ||
					v.assetCategory?.name?.toLowerCase().includes(q) ||
					v.companyName?.toLowerCase().includes(q) ||
					v.verifiedBy?.name?.toLowerCase().includes(q) ||
					v.registeredBy?.name?.toLowerCase().includes(q),
			);
		}

		return results;
	}, [data, searchQuery, dateRange]);

	const handleViewDetails = (verification: VerificationReportItem) => {
		if (verification.companyId) {
			navigate(`/super-user/companies/${verification.companyId}/assets/${verification.assetId}`);
		}
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
			{/* Header: title + stats inline + export */}
			<div className="flex-shrink-0 px-6 py-3 border-b bg-card/50">
				<div className="flex items-center justify-between gap-4 flex-wrap">
					<div>
						<h1 className="text-xl font-semibold">Reports</h1>
						<p className="text-xs text-muted-foreground">Verification reports across assigned companies</p>
					</div>

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
						companyId={companyId !== "all" ? companyId : undefined}
					/>
				</div>
			</div>

			{/* Company filter + all filters — compact single row */}
			<div className="flex-shrink-0 px-6 py-2 border-b">
				<div className="flex items-center gap-3 flex-wrap">
					<CompanyFilter
						value={companyId}
						onChange={(v) => {
							setCompanyId(v);
							setPage(1);
						}}
					/>
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
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
							className="h-7 w-7 p-0"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<span className="text-xs text-muted-foreground px-1">
							{page} / {totalPages}
						</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							disabled={page === totalPages}
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
