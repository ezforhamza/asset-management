import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import adminService, { type NotificationAssignment } from "@/api/services/adminService";
import type { UserInfo } from "#/entity";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Switch } from "@/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

interface NotificationAssignmentModalProps {
	user: UserInfo | null;
	open: boolean;
	onClose: () => void;
}

const NOTIFICATION_LABELS: Record<string, string> = {
	repair: "Repair",
	movement: "Movement",
	overdue: "Overdue",
};

export function NotificationAssignmentModal({ user, open, onClose }: NotificationAssignmentModalProps) {
	const queryClient = useQueryClient();
	const userId = user?.id || "";

	const [newCompanyId, setNewCompanyId] = useState("");
	const [newTypes, setNewTypes] = useState<string[]>([]);
	const [receiveAll, setReceiveAll] = useState(false);

	const { data: assignmentsData, isLoading } = useQuery({
		queryKey: ["super-user-assignments", userId],
		queryFn: () => adminService.getNotificationAssignments(userId),
		enabled: open && !!userId,
	});

	const { data: companiesData } = useQuery({
		queryKey: ["admin", "companies"],
		queryFn: () => adminService.getCompanies({ limit: 100 }),
		enabled: open,
	});

	const addMutation = useMutation({
		mutationFn: () =>
			adminService.addNotificationAssignment(userId, {
				companyId: newCompanyId,
				notificationTypes: receiveAll ? undefined : newTypes,
				receiveAll,
			}),
		onSuccess: () => {
			toast.success("Assignment added");
			queryClient.invalidateQueries({ queryKey: ["super-user-assignments", userId] });
			setNewCompanyId("");
			setNewTypes([]);
			setReceiveAll(false);
		},
		onError: () => {},
	});

	const removeMutation = useMutation({
		mutationFn: (companyId: string) => adminService.removeNotificationAssignment(userId, companyId),
		onSuccess: () => {
			toast.success("Assignment removed");
			queryClient.invalidateQueries({ queryKey: ["super-user-assignments", userId] });
		},
		onError: () => {},
	});

	const assignments: NotificationAssignment[] = assignmentsData?.assignments || [];
	const availableTypes: string[] = assignmentsData?.availableTypes || ["repair", "movement", "overdue"];
	const companies = companiesData?.results || [];
	const assignedCompanyIds = new Set(assignments.map((a) => a.companyId));
	const availableCompanies = companies.filter((c) => !assignedCompanyIds.has(c._id));

	const toggleType = (type: string) => {
		setNewTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
	};

	const canAdd = newCompanyId && (receiveAll || newTypes.length > 0);

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[620px] max-h-[85vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>Manage Notification Assignments</DialogTitle>
					<DialogDescription>for {user?.name}</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto space-y-5 py-2">
					{/* Current Assignments */}
					<div>
						<h4 className="text-sm font-medium mb-2">Current Assignments</h4>
						{isLoading ? (
							<Skeleton className="h-24 w-full" />
						) : assignments.length === 0 ? (
							<p className="text-sm text-muted-foreground py-4 text-center border rounded-md">No assignments yet.</p>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Company</TableHead>
										<TableHead>Notification Types</TableHead>
										<TableHead className="w-[60px]" />
									</TableRow>
								</TableHeader>
								<TableBody>
									{assignments.map((a) => (
										<TableRow key={a.companyId}>
											<TableCell className="font-medium">{a.companyName}</TableCell>
											<TableCell>
												{a.receiveAll ? (
													<Badge variant="secondary">All notifications</Badge>
												) : (
													<div className="flex flex-wrap gap-1">
														{a.notificationTypes.map((t) => (
															<Badge key={t} variant="outline" className="text-xs">
																{NOTIFICATION_LABELS[t] ?? t}
															</Badge>
														))}
													</div>
												)}
											</TableCell>
											<TableCell>
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7 text-destructive hover:text-destructive"
													onClick={() => removeMutation.mutate(a.companyId)}
													disabled={removeMutation.isPending}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</div>

					{/* Add New Assignment */}
					<div className="border rounded-lg p-4 space-y-4">
						<h4 className="text-sm font-medium">Add New Assignment</h4>

						<div className="space-y-2">
							<Label>Company</Label>
							<Select value={newCompanyId} onValueChange={setNewCompanyId}>
								<SelectTrigger>
									<SelectValue placeholder="Select a company" />
								</SelectTrigger>
								<SelectContent>
									{availableCompanies.map((c) => (
										<SelectItem key={c._id} value={c._id}>
											{c.companyName}
										</SelectItem>
									))}
									{availableCompanies.length === 0 && (
										<div className="px-2 py-1.5 text-sm text-muted-foreground">All companies assigned</div>
									)}
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center gap-2">
							<Switch id="receiveAll" checked={receiveAll} onCheckedChange={setReceiveAll} />
							<Label htmlFor="receiveAll">Receive all notification types</Label>
						</div>

						{!receiveAll && (
							<div className="space-y-2">
								<Label>Notification Types</Label>
								<div className="flex flex-wrap gap-4">
									{availableTypes.map((type) => (
										<div key={type} className="flex items-center gap-2">
											<Checkbox
												id={`type-${type}`}
												checked={newTypes.includes(type)}
												onCheckedChange={() => toggleType(type)}
											/>
											<Label htmlFor={`type-${type}`} className="font-normal cursor-pointer">
												{NOTIFICATION_LABELS[type] ?? type}
											</Label>
										</div>
									))}
								</div>
							</div>
						)}

						<Button onClick={() => addMutation.mutate()} disabled={!canAdd || addMutation.isPending} size="sm">
							{addMutation.isPending ? (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							) : (
								<Plus className="h-4 w-4 mr-2" />
							)}
							Add Assignment
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
