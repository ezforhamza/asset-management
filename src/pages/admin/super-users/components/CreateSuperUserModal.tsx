import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import adminService from "@/api/services/adminService";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { PasswordInput } from "@/ui/password-input";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";

interface DeriveFrom {
	type: "read_only" | "read_write";
	preSelectedCompanyIds: string[];
}

interface CreateSuperUserModalProps {
	open: boolean;
	onClose: () => void;
	deriveFrom?: DeriveFrom;
}

interface FormValues {
	name: string;
	email: string;
	password: string;
	superUserType: "read_only" | "read_write";
}

interface CreatedCredentials {
	name: string;
	email: string;
	password: string;
}

type Step = "form" | "credentials" | "assign";

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);
	return (
		<Button
			variant="ghost"
			size="icon"
			className="h-7 w-7 shrink-0"
			onClick={() => {
				navigator.clipboard.writeText(text);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			}}
		>
			{copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
		</Button>
	);
}

export function CreateSuperUserModal({ open, onClose, deriveFrom }: CreateSuperUserModalProps) {
	const queryClient = useQueryClient();
	const [step, setStep] = useState<Step>("form");
	const [createdUserId, setCreatedUserId] = useState<string | null>(null);
	const [credentials, setCredentials] = useState<CreatedCredentials | null>(null);
	const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
	const [isAssigning, setIsAssigning] = useState(false);

	// When deriving, pre-select opposite type
	const defaultType: "read_only" | "read_write" = deriveFrom
		? deriveFrom.type === "read_only"
			? "read_write"
			: "read_only"
		: "read_only";

	const form = useForm<FormValues>({
		defaultValues: { name: "", email: "", password: "", superUserType: defaultType },
	});

	const { data: availableData, isLoading: isLoadingCompanies } = useQuery({
		queryKey: ["available-companies-create"],
		queryFn: () => adminService.getAvailableCompaniesForSuperUser(),
		enabled: step === "assign",
	});
	const availableCompanies = availableData?.companies || [];

	// Pre-check source user's companies when deriving (filter to only available ones)
	useEffect(() => {
		if (step === "assign" && deriveFrom && availableCompanies.length > 0 && selectedCompanyIds.length === 0) {
			const availableIds = new Set(availableCompanies.map((c) => c._id));
			const preChecked = deriveFrom.preSelectedCompanyIds.filter((id) => availableIds.has(id));
			if (preChecked.length > 0) setSelectedCompanyIds(preChecked);
		}
	}, [step, deriveFrom, availableCompanies, selectedCompanyIds.length]);

	const mutation = useMutation({
		mutationFn: (data: FormValues) =>
			adminService.createSuperUserAccount({
				name: data.name,
				email: data.email,
				password: data.password || undefined,
				superUserType: data.superUserType,
			} as never),
		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({ queryKey: ["admin", "super-users"] });
			const res = response as { user?: { id?: string; _id?: string }; temporaryPassword?: string };
			const userId = res.user?.id || res.user?._id || "";
			setCreatedUserId(userId);
			if (res.temporaryPassword) {
				setCredentials({ name: variables.name, email: variables.email, password: res.temporaryPassword });
				setStep("credentials");
			} else {
				setStep("assign");
			}
			if (!res.temporaryPassword) {
				toast.success("Super user created successfully");
			}
		},
		onError: () => {},
	});

	const handleFinishAssign = async () => {
		if (!createdUserId || selectedCompanyIds.length === 0) {
			handleClose();
			return;
		}
		setIsAssigning(true);
		try {
			await adminService.addCompanyAssignment(createdUserId, { companyIds: selectedCompanyIds });
			toast.success(
				`${selectedCompanyIds.length} company assignment${selectedCompanyIds.length !== 1 ? "s" : ""} saved`,
			);
		} catch {}
		setIsAssigning(false);
		handleClose();
	};

	const handleClose = () => {
		const resetType: "read_only" | "read_write" = deriveFrom
			? deriveFrom.type === "read_only"
				? "read_write"
				: "read_only"
			: "read_only";
		form.reset({ name: "", email: "", password: "", superUserType: resetType });
		setStep("form");
		setCredentials(null);
		setCreatedUserId(null);
		setSelectedCompanyIds([]);
		onClose();
	};

	const toggleCompany = (id: string) => {
		setSelectedCompanyIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
	};

	// Step: Credentials
	if (step === "credentials" && credentials) {
		const bothText = `Email: ${credentials.email} | Password: ${credentials.password}`;
		return (
			<Dialog open={open} onOpenChange={handleClose}>
				<DialogContent className="sm:max-w-[480px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Check className="h-5 w-5 text-emerald-500" />
							Super user created successfully
						</DialogTitle>
						<DialogDescription>
							Share these credentials. This password will <strong>NOT</strong> be shown again.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-3 py-2">
						<div className="p-4 bg-muted rounded-lg space-y-3">
							{[
								{ label: "Name", value: credentials.name },
								{ label: "Email", value: credentials.email },
								{ label: "Password", value: credentials.password },
							].map(({ label, value }) => (
								<div key={label} className="flex items-center justify-between gap-2">
									<div className="min-w-0">
										<p className="text-xs text-muted-foreground">{label}</p>
										<p className="font-mono text-sm break-all">{value}</p>
									</div>
									<CopyButton text={value} />
								</div>
							))}
						</div>
						<Button
							variant="outline"
							size="sm"
							className="w-full"
							onClick={() => {
								navigator.clipboard.writeText(bothText);
								toast.success("Credentials copied");
							}}
						>
							<Copy className="h-4 w-4 mr-2" />
							Copy Both
						</Button>
					</div>
					<DialogFooter>
						<Button onClick={() => setStep("assign")}>Done — Assign Companies</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	// Step: Assign Companies
	if (step === "assign") {
		return (
			<Dialog open={open} onOpenChange={handleClose}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Assign Companies</DialogTitle>
						<DialogDescription>
							{deriveFrom
								? "Pre-selected from source user. Adjust as needed."
								: "Select which companies this support user can access. You can change this later."}
						</DialogDescription>
					</DialogHeader>
					<div className="max-h-[340px] overflow-y-auto space-y-1 py-1">
						{isLoadingCompanies ? (
							<div className="flex justify-center py-8">
								<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							</div>
						) : availableCompanies.length === 0 ? (
							<p className="text-sm text-muted-foreground text-center py-8">No available companies to assign.</p>
						) : (
							availableCompanies.map((c) => (
								<div
									key={c._id}
									className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted/50 cursor-pointer"
									onClick={() => toggleCompany(c._id)}
								>
									<Checkbox id={c._id} checked={selectedCompanyIds.includes(c._id)} />
									<Label className="flex-1 cursor-pointer">
										<span className="font-medium">{c.companyName}</span>
										<span className="text-xs text-muted-foreground ml-2">{c.contactEmail}</span>
									</Label>
								</div>
							))
						)}
					</div>
					<DialogFooter className="gap-2">
						<Button variant="ghost" onClick={handleClose}>
							Skip for now
						</Button>
						<Button onClick={handleFinishAssign} disabled={isAssigning}>
							{isAssigning && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							{selectedCompanyIds.length > 0 ? `Assign ${selectedCompanyIds.length} & Finish` : "Finish"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	// Step: Form (default)
	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[460px]">
				<DialogHeader>
					<DialogTitle>Create Super User</DialogTitle>
					<DialogDescription>Create a support team member. Leave password blank to auto-generate.</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							rules={{ required: "Name is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name *</FormLabel>
									<FormControl>
										<Input placeholder="John Support" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							rules={{ required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email *</FormLabel>
									<FormControl>
										<Input type="email" placeholder="support@company.com" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password (optional)</FormLabel>
									<FormControl>
										<PasswordInput placeholder="Leave blank to auto-generate" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="superUserType"
							rules={{ required: "Type is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Type *</FormLabel>
									<FormControl>
										<RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-6 pt-1">
											<div className="flex items-center gap-2">
												<RadioGroupItem value="read_only" id="type-read-only" />
												<Label htmlFor="type-read-only" className="cursor-pointer">
													<span className="font-medium">Read-Only</span>
													<p className="text-xs text-muted-foreground font-normal">View only, no edits</p>
												</Label>
											</div>
											<div className="flex items-center gap-2">
												<RadioGroupItem value="read_write" id="type-read-write" />
												<Label htmlFor="type-read-write" className="cursor-pointer">
													<span className="font-medium">Read-Write</span>
													<p className="text-xs text-muted-foreground font-normal">Can edit assets + GPS</p>
												</Label>
											</div>
										</RadioGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={handleClose}>
								Cancel
							</Button>
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								Create
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
