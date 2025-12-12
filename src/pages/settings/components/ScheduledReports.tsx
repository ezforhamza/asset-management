import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import reportService from "@/api/services/reportService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Switch } from "@/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export function ScheduledReports() {
	const queryClient = useQueryClient();
	const [createOpen, setCreateOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	// Form state
	const [frequency, setFrequency] = useState("weekly");
	const [recipients, setRecipients] = useState("");
	const [includeAttachment, setIncludeAttachment] = useState(true);

	const { data: schedules, isLoading } = useQuery({
		queryKey: ["reports", "schedules"],
		queryFn: () => reportService.getSchedules(),
	});

	const handleCreate = async () => {
		setLoading(true);
		try {
			await reportService.createSchedule({
				frequency: frequency as "daily" | "weekly" | "monthly",
				recipients: recipients.split(",").map((e) => e.trim()),
				reportType: "verification_summary",
				includeAttachment,
			});
			toast.success("Scheduled report created");
			setCreateOpen(false);
			setRecipients("");
			queryClient.invalidateQueries({ queryKey: ["reports", "schedules"] });
		} catch {
			toast.error("Failed to create scheduled report");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (scheduleId: string) => {
		try {
			await reportService.deleteSchedule(scheduleId);
			toast.success("Scheduled report deleted");
			queryClient.invalidateQueries({ queryKey: ["reports", "schedules"] });
		} catch {
			toast.error("Failed to delete scheduled report");
		}
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
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-red-500 hover:text-red-600"
													onClick={() => handleDelete(schedule._id)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
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
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create Scheduled Report</DialogTitle>
						<DialogDescription>Set up automatic report delivery</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label>Frequency</Label>
							<Select value={frequency} onValueChange={setFrequency}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="daily">Daily</SelectItem>
									<SelectItem value="weekly">Weekly</SelectItem>
									<SelectItem value="monthly">Monthly</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>Recipients</Label>
							<Input
								placeholder="email1@company.com, email2@company.com"
								value={recipients}
								onChange={(e) => setRecipients(e.target.value)}
							/>
							<p className="text-xs text-muted-foreground">Separate multiple emails with commas</p>
						</div>

						<div className="flex items-center justify-between rounded-lg border p-3">
							<div className="space-y-0.5">
								<p className="text-sm font-medium">Include CSV Attachment</p>
								<p className="text-xs text-muted-foreground">Attach detailed data as CSV file</p>
							</div>
							<Switch checked={includeAttachment} onCheckedChange={setIncludeAttachment} />
						</div>

						<div className="flex gap-3 pt-2">
							<Button variant="outline" onClick={() => setCreateOpen(false)} className="flex-1">
								Cancel
							</Button>
							<Button onClick={handleCreate} disabled={loading || !recipients} className="flex-1">
								{loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								Create Schedule
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

export default ScheduledReports;
