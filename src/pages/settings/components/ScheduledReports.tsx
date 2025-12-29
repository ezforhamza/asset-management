import { useMutation } from "@tanstack/react-query";
import { Calendar, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import reportService, {
	type CreateScheduledReportReq,
	type ScheduledReportFormat,
	type ScheduledReportFrequency,
	type ScheduledReportType,
} from "@/api/services/reportService";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Switch } from "@/ui/switch";

const REPORT_TYPES: { value: ScheduledReportType; label: string }[] = [
	{ value: "verification_summary", label: "Verification Summary" },
	{ value: "asset_status", label: "Asset Status" },
	{ value: "overdue_assets", label: "Overdue Assets" },
	{ value: "compliance", label: "Compliance Report" },
];

const FREQUENCIES: { value: ScheduledReportFrequency; label: string }[] = [
	{ value: "daily", label: "Daily" },
	{ value: "weekly", label: "Weekly" },
	{ value: "monthly", label: "Monthly" },
	{ value: "quarterly", label: "Quarterly" },
];

const FORMATS: { value: ScheduledReportFormat; label: string }[] = [
	{ value: "csv", label: "CSV" },
	{ value: "pdf", label: "PDF" },
	{ value: "xlsx", label: "Excel (XLSX)" },
];

export function ScheduledReports() {
	// Form state
	const [name, setName] = useState("");
	const [reportType, setReportType] = useState<ScheduledReportType>("verification_summary");
	const [frequency, setFrequency] = useState<ScheduledReportFrequency>("weekly");
	const [reportFormat, setReportFormat] = useState<ScheduledReportFormat>("csv");
	const [recipients, setRecipients] = useState("");
	const [includePhotos, setIncludePhotos] = useState(false);

	const createMutation = useMutation({
		mutationFn: (data: CreateScheduledReportReq) => reportService.createSchedule(data),
		onSuccess: () => {
			toast.success("Scheduled report created");
			resetForm();
		},
		onError: () => {
			toast.error("Failed to create scheduled report");
		},
	});

	const resetForm = () => {
		setName("");
		setReportType("verification_summary");
		setFrequency("weekly");
		setReportFormat("csv");
		setRecipients("");
		setIncludePhotos(false);
	};

	const handleCreate = () => {
		const recipientList = recipients
			.split(",")
			.map((e) => e.trim())
			.filter(Boolean);
		if (recipientList.length === 0) {
			toast.error("Please enter at least one recipient email");
			return;
		}

		createMutation.mutate({
			name:
				name ||
				`${frequency.charAt(0).toUpperCase() + frequency.slice(1)} ${REPORT_TYPES.find((r) => r.value === reportType)?.label}`,
			reportType,
			frequency,
			format: reportFormat,
			recipients: recipientList,
			filters: { includePhotos },
			isActive: true,
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Calendar className="h-5 w-5" />
					Scheduled Reports
				</CardTitle>
				<CardDescription>Set up automatic report delivery to recipients on a schedule</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="space-y-2">
						<Label>Report Name (optional)</Label>
						<Input
							placeholder="e.g., Weekly Verification Summary"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>Report Type</Label>
							<Select value={reportType} onValueChange={(v) => setReportType(v as ScheduledReportType)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{REPORT_TYPES.map((type) => (
										<SelectItem key={type.value} value={type.value}>
											{type.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>Frequency</Label>
							<Select value={frequency} onValueChange={(v) => setFrequency(v as ScheduledReportFrequency)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{FREQUENCIES.map((freq) => (
										<SelectItem key={freq.value} value={freq.value}>
											{freq.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-2">
						<Label>Format</Label>
						<Select value={reportFormat} onValueChange={(v) => setReportFormat(v as ScheduledReportFormat)}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{FORMATS.map((fmt) => (
									<SelectItem key={fmt.value} value={fmt.value}>
										{fmt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>Recipients</Label>
						<Input
							placeholder="admin@company.com, manager@company.com"
							value={recipients}
							onChange={(e) => setRecipients(e.target.value)}
						/>
						<p className="text-xs text-muted-foreground">Separate multiple emails with commas</p>
					</div>

					<div className="flex items-center justify-between rounded-lg border p-3">
						<div className="space-y-0.5">
							<p className="text-sm font-medium">Include Photos</p>
							<p className="text-xs text-muted-foreground">Include verification photos in the report</p>
						</div>
						<Switch checked={includePhotos} onCheckedChange={setIncludePhotos} />
					</div>

					<Button onClick={handleCreate} disabled={createMutation.isPending || !recipients}>
						{createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						Create Schedule
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

export default ScheduledReports;
