import { format } from "date-fns";
import { AlertTriangle, CheckCircle, Eye } from "lucide-react";
import type { VerificationReportItem } from "#/report";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";

interface ReportTableProps {
	data: VerificationReportItem[];
	isLoading: boolean;
	onViewDetails: (verification: VerificationReportItem) => void;
}

export function ReportTable({ data, isLoading, onViewDetails }: ReportTableProps) {
	if (isLoading) {
		return (
			<div className="space-y-3">
				{Array.from({ length: 8 }).map((_, i) => (
					<Skeleton key={i} className="h-16 w-full" />
				))}
			</div>
		);
	}

	if (!data || data.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<div className="rounded-full bg-muted p-4 mb-4">
					<CheckCircle className="h-8 w-8 text-muted-foreground" />
				</div>
				<h3 className="font-semibold text-lg">No verifications found</h3>
				<p className="text-muted-foreground mt-1">Try adjusting your filters or date range</p>
			</div>
		);
	}

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "on_time":
				return <Badge className="bg-emerald-500">On Time</Badge>;
			case "due_soon":
				return <Badge className="bg-orange-500">Due Soon</Badge>;
			case "overdue":
				return <Badge variant="destructive">Overdue</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	return (
		<div className="rounded-xl border bg-card flex flex-col h-full overflow-hidden">
			{/* Fixed Header */}
			<div className="flex-shrink-0 border-b bg-muted/50 px-4">
				<div className="grid grid-cols-7 py-3 text-sm font-medium text-muted-foreground gap-4">
					<div>Asset</div>
					<div>Status</div>
					<div>Last Verified</div>
					<div>Next Due</div>
					<div>Days Until Due</div>
					<div>Total Verifications</div>
					<div className="text-right">Actions</div>
				</div>
			</div>
			{/* Scrollable Body */}
			<div className="flex-1 overflow-y-auto">
				{data.map((item) => (
					<div
						key={item._id}
						className="grid grid-cols-7 py-3 px-4 border-b last:border-0 items-center gap-4 hover:bg-muted/30 transition-colors"
					>
						<div>
							<p className="font-medium">{item.serialNumber || "N/A"}</p>
							<p className="text-sm text-muted-foreground">{item.makeModel}</p>
						</div>
						<div>{getStatusBadge(item.verificationStatus)}</div>
						<div>
							{item.lastVerifiedAt ? (
								<>
									<p className="text-sm">{format(new Date(item.lastVerifiedAt), "MMM dd, yyyy")}</p>
									<p className="text-xs text-muted-foreground">{format(new Date(item.lastVerifiedAt), "hh:mm a")}</p>
								</>
							) : (
								<span className="text-sm text-muted-foreground">Never</span>
							)}
						</div>
						<div>
							<p className="text-sm">{format(new Date(item.nextVerificationDue), "MMM dd, yyyy")}</p>
							<p className="text-xs text-muted-foreground">{format(new Date(item.nextVerificationDue), "hh:mm a")}</p>
						</div>
						<div>
							<span
								className={`text-sm font-medium ${
									item.daysUntilDue < 0
										? "text-red-500"
										: item.daysUntilDue < 7
											? "text-orange-500"
											: "text-emerald-500"
								}`}
							>
								{item.daysUntilDue.toFixed(0)} days
							</span>
						</div>
						<div className="text-sm">{item.totalVerifications}</div>
						<div className="text-right">
							<Button variant="ghost" size="sm" onClick={() => onViewDetails(item)}>
								<Eye className="h-4 w-4 mr-1" />
								View
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default ReportTable;
