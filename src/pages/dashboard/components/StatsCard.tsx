import { Card, CardContent } from "@/ui/card";
import { cn } from "@/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
	title: string;
	value: number | string;
	subtitle?: string;
	icon: LucideIcon;
	trend?: {
		value: number;
		isPositive: boolean;
	};
	variant?: "default" | "success" | "warning" | "danger";
}

const variantStyles = {
	default: {
		icon: "bg-primary/10 text-primary",
		card: "",
	},
	success: {
		icon: "bg-emerald-500/10 text-emerald-500",
		card: "",
	},
	warning: {
		icon: "bg-orange-500/10 text-orange-500",
		card: "",
	},
	danger: {
		icon: "bg-red-500/10 text-red-500",
		card: "",
	},
};

export function StatsCard({ title, value, subtitle, icon: Icon, trend, variant = "default" }: StatsCardProps) {
	const styles = variantStyles[variant];

	return (
		<Card className={cn("relative overflow-hidden", styles.card)}>
			<CardContent className="p-6">
				<div className="flex items-start justify-between">
					<div className="space-y-2">
						<p className="text-sm font-medium text-muted-foreground">{title}</p>
						<div className="flex items-baseline gap-2">
							<h3 className="text-3xl font-bold tracking-tight">{value}</h3>
							{trend && (
								<span className={cn("text-sm font-medium", trend.isPositive ? "text-emerald-500" : "text-red-500")}>
									{trend.isPositive ? "+" : "-"}
									{Math.abs(trend.value)}%
								</span>
							)}
						</div>
						{subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
					</div>
					<div className={cn("rounded-xl p-3", styles.icon)}>
						<Icon className="h-6 w-6" />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default StatsCard;
