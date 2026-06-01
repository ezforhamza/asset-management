import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserInfo } from "#/entity";
import adminService from "@/api/services/adminService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { getCompanyStatusBadge } from "@/utils/badge-styles";

interface ManageCompaniesModalProps {
	user: UserInfo | null;
	open: boolean;
	onClose: () => void;
}

export function ManageCompaniesModal({ user, open, onClose }: ManageCompaniesModalProps) {
	const queryClient = useQueryClient();
	const [selectedCompanyId, setSelectedCompanyId] = useState("");

	const superUserType = (user as (UserInfo & { superUserType?: string }) | null)?.superUserType || "read_only";

	const { data: assignmentsData, isLoading: isLoadingAssignments } = useQuery({
		queryKey: ["company-assignments", user?.id],
		queryFn: () => adminService.getCompanyAssignments(user!.id),
		enabled: !!user?.id && open,
	});

	const { data: availableData, isLoading: isLoadingAvailable } = useQuery({
		queryKey: ["available-companies", superUserType, user?.id],
		queryFn: () => adminService.getAvailableCompaniesForSuperUser(superUserType, user!.id),
		enabled: !!user?.id && open,
	});

	const assignments = assignmentsData?.assignments || [];
	const assignedIds = new Set(assignments.map((a) => a.companyId));
	const availableCompanies = (availableData?.companies || []).filter((c) => !assignedIds.has(c._id));

	const addMutation = useMutation({
		mutationFn: () => adminService.addCompanyAssignment(user!.id, { companyId: selectedCompanyId }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["company-assignments", user?.id] });
			queryClient.invalidateQueries({ queryKey: ["available-companies"] });
			setSelectedCompanyId("");
			toast.success("Company assigned");
		},
		onError: () => {},
	});

	const removeMutation = useMutation({
		mutationFn: (companyId: string) => adminService.removeCompanyAssignment(user!.id, companyId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["company-assignments", user?.id] });
			queryClient.invalidateQueries({ queryKey: ["available-companies"] });
			toast.success("Company removed");
		},
		onError: () => {},
	});

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[580px]">
				<DialogHeader>
					<DialogTitle>Manage Companies — {user?.name}</DialogTitle>
				</DialogHeader>

				{/* Current Assignments */}
				<div className="space-y-3">
					<p className="text-sm font-medium">Assigned Companies</p>
					{isLoadingAssignments ? (
						<div className="space-y-2">
							{Array.from({ length: 3 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
								<Skeleton key={i} className="h-10 w-full" />
							))}
						</div>
					) : assignments.length === 0 ? (
						<p className="text-sm text-muted-foreground py-4 text-center border rounded-lg bg-muted/30">
							No companies assigned yet.
						</p>
					) : (
						<div className="rounded-md border max-h-[280px] overflow-auto">
							<Table>
								<TableHeader className="sticky top-0 bg-background z-10">
									<TableRow>
										<TableHead>Company</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Assigned At</TableHead>
										<TableHead className="w-[50px]" />
									</TableRow>
								</TableHeader>
								<TableBody>
									{assignments.map((a) => (
										<TableRow key={a.companyId}>
											<TableCell className="font-medium">{a.companyName}</TableCell>
											<TableCell>{getCompanyStatusBadge(a.isActive ? "active" : "inactive")}</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{a.assignedAt ? format(new Date(a.assignedAt), "MMM d, yyyy") : "—"}
											</TableCell>
											<TableCell>
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7 text-destructive hover:text-destructive"
													onClick={() => removeMutation.mutate(a.companyId)}
													disabled={removeMutation.isPending}
												>
													<Trash2 className="h-3.5 w-3.5" />
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</div>

				{/* Add Company */}
				<div className="space-y-2 pt-2 border-t">
					<p className="text-sm font-medium">Add Company</p>
					<div className="flex items-center gap-2">
						<Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
							<SelectTrigger className="flex-1">
								<SelectValue
									placeholder={
										isLoadingAvailable
											? "Loading..."
											: availableCompanies.length === 0
												? "No more companies available"
												: "Select a company"
									}
								/>
							</SelectTrigger>
							<SelectContent>
								{availableCompanies.map((c) => (
									<SelectItem key={c._id} value={c._id}>
										{c.companyName}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button
							onClick={() => addMutation.mutate()}
							disabled={!selectedCompanyId || addMutation.isPending}
							size="sm"
						>
							{addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
							Add
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
