import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Calendar } from "@/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { CalendarIcon, Search, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/utils";
import type { DateRange } from "react-day-picker";

interface ReportFiltersProps {
	dateRange: DateRange | undefined;
	setDateRange: (range: DateRange | undefined) => void;
	status: string;
	setStatus: (status: string) => void;
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	onClearFilters: () => void;
}

export function ReportFilters({
	dateRange,
	setDateRange,
	status,
	setStatus,
	searchQuery,
	setSearchQuery,
	onClearFilters,
}: ReportFiltersProps) {
	const hasFilters = dateRange?.from || dateRange?.to || status !== "all" || searchQuery;

	return (
		<div className="flex flex-col gap-4 md:flex-row md:items-end">
			{/* Search */}
			<div className="flex-1 max-w-sm">
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

			{/* Date Range */}
			<div>
				<Label className="text-sm font-medium mb-2 block">Date Range</Label>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn("w-[280px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
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
					<SelectTrigger className="w-[150px]">
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
