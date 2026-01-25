import { format } from "date-fns";
import { CalendarIcon, Search, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import type { AssetCategory } from "@/api/services/assetCategoryService";
import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { cn } from "@/utils";

interface ReportFiltersProps {
	dateRange: DateRange | undefined;
	setDateRange: (range: DateRange | undefined) => void;
	status: string;
	setStatus: (status: string) => void;
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	gpsFilter: string;
	setGpsFilter: (value: string) => void;
	conditionFilter: string;
	setConditionFilter: (value: string) => void;
	operationalFilter: string;
	setOperationalFilter: (value: string) => void;
	categoryFilter: string;
	setCategoryFilter: (value: string) => void;
	categories: AssetCategory[];
	onClearFilters: () => void;
}

export function ReportFilters({
	dateRange,
	setDateRange,
	status,
	setStatus,
	searchQuery,
	setSearchQuery,
	gpsFilter,
	setGpsFilter,
	conditionFilter,
	setConditionFilter,
	operationalFilter,
	setOperationalFilter,
	categoryFilter,
	setCategoryFilter,
	categories,
	onClearFilters,
}: ReportFiltersProps) {
	const hasFilters =
		dateRange?.from ||
		dateRange?.to ||
		status !== "all" ||
		searchQuery ||
		gpsFilter !== "all" ||
		conditionFilter !== "all" ||
		operationalFilter !== "all" ||
		categoryFilter !== "all";

	return (
		<div className="flex flex-wrap gap-3 items-end">
			{/* Search */}
			<div className="flex-1 min-w-[150px] max-w-[200px]">
				<Label htmlFor="search" className="text-sm font-medium mb-2 block">
					Search
				</Label>
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						id="search"
						placeholder="Serial number, make, model..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>

			{/* Date Range - filters by Next Due Date */}
			<div>
				<Label className="text-sm font-medium mb-2 block">Due Date</Label>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn(
								"w-[160px] justify-start text-left font-normal text-xs",
								!dateRange && "text-muted-foreground",
							)}
						>
							<CalendarIcon className="mr-1 h-3 w-3 flex-shrink-0" />
							{dateRange?.from ? (
								dateRange.to ? (
									<span className="truncate">
										{format(dateRange.from, "MM/dd")} - {format(dateRange.to, "MM/dd")}
									</span>
								) : (
									format(dateRange.from, "MM/dd/yy")
								)
							) : (
								<span>Select dates</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							initialFocus
							mode="range"
							defaultMonth={dateRange?.from}
							selected={dateRange}
							onSelect={setDateRange}
							numberOfMonths={2}
						/>
					</PopoverContent>
				</Popover>
			</div>

			{/* Status Filter */}
			<div>
				<Label className="text-sm font-medium mb-2 block">Status</Label>
				<Select value={status} onValueChange={setStatus}>
					<SelectTrigger className="w-[110px]">
						<SelectValue placeholder="All Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="on_time">On Time</SelectItem>
						<SelectItem value="due_soon">Due Soon</SelectItem>
						<SelectItem value="overdue">Overdue</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* GPS Filter */}
			<div>
				<Label className="text-sm font-medium mb-2 block">GPS</Label>
				<Select value={gpsFilter} onValueChange={setGpsFilter}>
					<SelectTrigger className="w-[120px]">
						<SelectValue placeholder="All" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All</SelectItem>
						<SelectItem value="true">Passed</SelectItem>
						<SelectItem value="false">Failed</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Condition Filter */}
			<div>
				<Label className="text-sm font-medium mb-2 block">Condition</Label>
				<Select value={conditionFilter} onValueChange={setConditionFilter}>
					<SelectTrigger className="w-[120px]">
						<SelectValue placeholder="All" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All</SelectItem>
						<SelectItem value="good">Good</SelectItem>
						<SelectItem value="fair">Fair</SelectItem>
						<SelectItem value="poor">Poor</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Operational Filter */}
			<div>
				<Label className="text-sm font-medium mb-2 block">Operational</Label>
				<Select value={operationalFilter} onValueChange={setOperationalFilter}>
					<SelectTrigger className="w-[130px]">
						<SelectValue placeholder="All" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All</SelectItem>
						<SelectItem value="operational">Operational</SelectItem>
						<SelectItem value="needs_repair">Needs Repair</SelectItem>
						<SelectItem value="non_operational">Non-Operational</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Category Filter */}
			<div>
				<Label className="text-sm font-medium mb-2 block">Category</Label>
				<Select value={categoryFilter} onValueChange={setCategoryFilter}>
					<SelectTrigger className="w-[130px]">
						<SelectValue placeholder="All" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Categories</SelectItem>
						{categories.map((cat) => (
							<SelectItem key={cat.id} value={cat.id}>
								{cat.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Clear Filters */}
			{hasFilters && (
				<Button variant="ghost" size="sm" onClick={onClearFilters} className="h-10">
					<X className="h-4 w-4 mr-1" />
					Clear
				</Button>
			)}
		</div>
	);
}

export default ReportFilters;
