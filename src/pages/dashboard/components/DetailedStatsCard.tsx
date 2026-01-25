import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/ui/card";
import { cn } from "@/utils";

interface StatItem {
	label: string;
	value: number | string;
	icon?: LucideIcon;
	iconColor?: string;
}

interface DetailedStatsCardProps {
	title: string;
	icon: LucideIcon;
	items: StatItem[];
	variant?: "default" | "success" | "warning" | "danger";
}

const variantStyles = {
	default: {
		icon: "bg-primary/10 text-primary",
		card: "hover:shadow-md hover:border-primary/20 transition-all duration-200",
		accent: "bg-gradient-to-r from-primary/5 to-transparent",
	},
	success: {
		icon: "bg-emerald-500/10 text-emerald-500",
		card: "hover:shadow-md hover:border-emerald-500/20 transition-all duration-200",
		accent: "bg-gradient-to-r from-emerald-500/5 to-transparent",
	},
	warning: {
		icon: "bg-orange-500/10 text-orange-500",
		card: "hover:shadow-md hover:border-orange-500/20 transition-all duration-200",
		accent: "bg-gradient-to-r from-orange-500/5 to-transparent",
	},
	danger: {
		icon: "bg-red-500/10 text-red-500",
		card: "hover:shadow-md hover:border-red-500/20 transition-all duration-200",
		accent: "bg-gradient-to-r from-red-500/5 to-transparent",
	},
};

export function DetailedStatsCard({ title, icon: Icon, items, variant = "default" }: DetailedStatsCardProps) {
	const styles = variantStyles[variant];

	return (
		<Card className={cn("relative overflow-hidden border", styles.card)}>
			<div className={cn("absolute inset-0 opacity-50", styles.accent)} />
			<CardContent className="p-5 relative">
				<div className="flex items-center gap-2 mb-3">
					<div className={cn("rounded-lg p-2 shadow-sm", styles.icon)}>
						<Icon className="h-4 w-4" />
					</div>
					<p className="text-sm font-medium text-muted-foreground">{title}</p>
				</div>
				<div className="space-y-2">
					{items.map((item) => (
						<div key={item.label} className="flex items-center gap-2">
							{item.icon && <item.icon className={cn("h-3.5 w-3.5", item.iconColor || "text-muted-foreground")} />}
							<span className="text-sm">
								<strong className="font-semibold">{item.value}</strong>{" "}
								<span className="text-muted-foreground">{item.label}</span>
							</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export default DetailedStatsCard;
