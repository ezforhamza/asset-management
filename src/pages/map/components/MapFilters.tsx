import { AlertTriangle, CheckCircle, Clock, MapPin } from "lucide-react";
import { VerificationStatus } from "#/enum";
import { Button } from "@/ui/button";
import { cn } from "@/utils";

interface MapFiltersProps {
	selectedStatus: VerificationStatus | "all";
	onStatusChange: (status: VerificationStatus | "all") => void;
	counts: {
		total: number;
		onTime: number;
		dueSoon: number;
		overdue: number;
	};
}

const statusFilters = [
	{
		value: "all" as const,
		label: "All Assets",
		icon: MapPin,
		color: "text-foreground",
		bgColor: "bg-muted hover:bg-muted/80",
		activeColor: "bg-primary text-primary-foreground",
	},
	{
		value: VerificationStatus.ON_TIME,
		label: "On Time",
		icon: CheckCircle,
		color: "text-emerald-500",
		bgColor: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20",
		activeColor: "bg-emerald-500 text-white",
	},
	{
		value: VerificationStatus.DUE_SOON,
		label: "Due Soon",
		icon: Clock,
		color: "text-orange-500",
		bgColor: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20",
		activeColor: "bg-orange-500 text-white",
	},
	{
		value: VerificationStatus.OVERDUE,
		label: "Overdue",
		icon: AlertTriangle,
		color: "text-red-500",
		bgColor: "bg-red-500/10 hover:bg-red-500/20 border-red-500/20",
		activeColor: "bg-red-500 text-white",
	},
];

export function MapFilters({ selectedStatus, onStatusChange, counts }: MapFiltersProps) {
	const getCount = (value: VerificationStatus | "all") => {
		if (value === "all") return counts.total;
		if (value === VerificationStatus.ON_TIME) return counts.onTime;
		if (value === VerificationStatus.DUE_SOON) return counts.dueSoon;
		if (value === VerificationStatus.OVERDUE) return counts.overdue;
		return 0;
	};

	return (
		<div className="flex flex-wrap gap-2">
			{statusFilters.map((filter) => {
				const isActive = selectedStatus === filter.value;
				const count = getCount(filter.value);
				const Icon = filter.icon;

				return (
					<Button
						key={filter.value}
						variant="outline"
						size="sm"
						onClick={() => onStatusChange(filter.value)}
						className={cn(
							"transition-all duration-200 border",
							isActive ? filter.activeColor : filter.bgColor,
							!isActive && filter.color,
						)}
					>
						<Icon className="h-4 w-4 mr-1.5" />
						{filter.label}
						<span
							className={cn(
								"ml-2 rounded-full px-2 py-0.5 text-xs font-semibold",
								isActive ? "bg-white/20" : "bg-background",
							)}
						>
							{count}
						</span>
					</Button>
				);
			})}
		</div>
	);
}

export default MapFilters;
