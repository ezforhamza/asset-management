import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Loader2, Pause, Play, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import reportService, {
	type CreateScheduledReportReq,
	type ScheduledReportFormat,
	type ScheduledReportFrequency,
	type ScheduledReportType,
} from "@/api/services/reportService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Switch } from "@/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

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
	const queryClient = useQueryClient();
	const [createOpen, setCreateOpen] = useState(false);

	// Form state
	const [name, setName] = useState("");
	const [reportType, setReportType] = useState<ScheduledReportType>("verification_summary");
	const [frequency, setFrequency] = useState<ScheduledReportFrequency>("weekly");
	const [reportFormat, setReportFormat] = useState<ScheduledReportFormat>("csv");
	const [recipients, setRecipients] = useState("");
	const [includePhotos, setIncludePhotos] = useState(false);

	const { data: schedules, isLoading } = useQuery({
		queryKey: ["reports", "schedules"],
		queryFn: () => reportService.getSchedules(),
	});

	const createMutation = useMutation({
		mutationFn: (data: CreateScheduledReportReq) => reportService.createSchedule(data),
		onSuccess: () => {
			toast.success("Scheduled report created");
			setCreateOpen(false);
			resetForm();
			queryClient.invalidateQueries({ queryKey: ["reports", "schedules"] });
		},
		onError: () => {
			toast.error("Failed to create scheduled report");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (scheduleId: string) => reportService.deleteSchedule(scheduleId),
		onSuccess: () => {
			toast.success("Scheduled report deleted");
			queryClient.invalidateQueries({ queryKey: ["reports", "schedules"] });
		},
		onError: () => {
			toast.error("Failed to delete scheduled report");
		},
	});

	const toggleMutation = useMutation({
		mutationFn: ({ scheduleId, isActive }: { scheduleId: string; isActive: boolean }) =>
			reportService.toggleScheduleStatus(scheduleId, isActive),
		onSuccess: (_, variables) => {
			toast.success(variables.isActive ? "Schedule activated" : "Schedule paused");
			queryClient.invalidateQueries({ queryKey: ["reports", "schedules"] });
		},
		onError: () => {
			toast.error("Failed to update schedule status");
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
		<>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5" />
							Scheduled Reports
						</CardTitle>
						<CardDescription>Automatically send reports to recipients on a schedule</CardDescription>
					</div>
					<Button size="sm" onClick={() => setCreateOpen(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Add Schedule
					</Button>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : !schedules || schedules.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-muted-foreground">No scheduled reports</p>
							<p className="text-sm text-muted-foreground mt-1">Create a schedule to automatically send reports</p>
						</div>
					) : (
						<div className="rounded-lg border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Frequency</TableHead>
										<TableHead>Recipients</TableHead>
										<TableHead>Next Scheduled</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{schedules.map((schedule) => (
										<TableRow key={schedule._id}>
											<TableCell className="capitalize font-medium">{schedule.frequency}</TableCell>
											<TableCell>
												<div className="max-w-[200px] truncate">{schedule.recipients?.join(", ")}</div>
											</TableCell>
											<TableCell>
												{schedule.nextScheduled ? format(new Date(schedule.nextScheduled), "MMM dd, yyyy") : "N/A"}
											</TableCell>
											<TableCell>
												{schedule.isActive ? (
													<Badge variant="outline" className="bg-emerald-500/10 text-emerald-500">
														Active
													</Badge>
												) : (
													<Badge variant="outline" className="bg-muted">
														Paused
													</Badge>
												)}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1">
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8"
														onClick={() =>
															toggleMutation.mutate({ scheduleId: schedule._id, isActive: !schedule.isActive })
														}
														disabled={toggleMutation.isPending}
													>
														{schedule.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
													</Button>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-red-500 hover:text-red-600"
														onClick={() => deleteMutation.mutate(schedule._id)}
														disabled={deleteMutation.isPending}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Create Modal */}
			<Dialog open={createOpen} onOpenChange={setCreateOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Create Scheduled Report</DialogTitle>
						<DialogDescription>Set up automatic report delivery to recipients</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-2">
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
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setCreateOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleCreate} disabled={createMutation.isPending || !recipients}>
							{createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Create Schedule
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

export default ScheduledReports;
