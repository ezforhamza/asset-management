import { Badge } from "@/ui/badge";
import { cn } from "@/utils";
import { VerificationStatus } from "#/enum";

interface StatusBadgeProps {
	status: VerificationStatus;
	className?: string;
}

const statusConfig = {
	[VerificationStatus.ON_TIME]: {
		label: "On Time",
		className: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20",
	},
	[VerificationStatus.DUE_SOON]: {
		label: "Due Soon",
		className: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20",
	},
	[VerificationStatus.OVERDUE]: {
		label: "Overdue",
		className: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20",
	},
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
	const config = statusConfig[status];

	return (
		<Badge variant="outline" className={cn(config.className, className)}>
			{config.label}
		</Badge>
	);
}

export default StatusBadge;
