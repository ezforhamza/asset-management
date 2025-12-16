import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import adminService from "@/api/services/adminService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

interface CreateSuperuserModalProps {
	open: boolean;
	onClose: () => void;
}

interface FormValues {
	name: string;
	email: string;
	companyId: string;
}

export function CreateSuperuserModal({ open, onClose }: CreateSuperuserModalProps) {
	const queryClient = useQueryClient();
	const [tempPassword, setTempPassword] = useState<string | null>(null);

	const { data: companiesData } = useQuery({
		queryKey: ["admin", "companies"],
		queryFn: () => adminService.getCompanies({ limit: 100 }),
		enabled: open,
	});

	const form = useForm<FormValues>({
		defaultValues: { name: "", email: "", companyId: "" },
	});

	const mutation = useMutation({
		mutationFn: adminService.createSuperuser,
		onSuccess: (data) => {
			setTempPassword(data.temporaryPassword);
			toast.success(data.message || "Superuser created");
			queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
		},
		onError: () => {
			toast.error("Failed to create superuser");
		},
	});

	const handleClose = () => {
		form.reset();
		setTempPassword(null);
		onClose();
	};

	const handleSubmit = (values: FormValues) => {
		mutation.mutate(values);
	};

	const copyPassword = () => {
		if (tempPassword) {
			navigator.clipboard.writeText(tempPassword);
			toast.success("Password copied to clipboard");
		}
	};

	const companies = companiesData?.companies || [];

	// Show password result
	if (tempPassword) {
		return (
			<Dialog open={open} onOpenChange={handleClose}>
				<DialogContent className="sm:max-w-[450px]">
					<DialogHeader>
						<DialogTitle>Superuser Created</DialogTitle>
						<DialogDescription>
							Share this temporary password with the user. They will be required to change it on first login.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="p-4 bg-muted rounded-lg">
							<p className="text-sm text-muted-foreground mb-1">Temporary Password</p>
							<div className="flex items-center gap-2">
								<code className="flex-1 text-lg font-mono">{tempPassword}</code>
								<Button variant="ghost" size="icon" onClick={copyPassword}>
									<Copy className="h-4 w-4" />
								</Button>
							</div>
						</div>
						<p className="text-sm text-muted-foreground">An invitation email has been sent to the user.</p>
					</div>

					<DialogFooter>
						<Button onClick={handleClose}>Done</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Create Superuser</DialogTitle>
					<DialogDescription>Create an admin user for a company.</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="companyId"
							rules={{ required: "Please select a company" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Company *</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a company" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{companies.map((company) => (
												<SelectItem key={company._id} value={company._id}>
													{company.companyName}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="name"
							rules={{ required: "Name is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name *</FormLabel>
									<FormControl>
										<Input placeholder="Enter full name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							rules={{
								required: "Email is required",
								pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email *</FormLabel>
									<FormControl>
										<Input type="email" placeholder="admin@company.com" {...field} />
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
								Create Superuser
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
