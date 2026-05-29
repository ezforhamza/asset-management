import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import adminService from "@/api/services/adminService";
import { Alert, AlertDescription } from "@/ui/alert";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { PasswordInput } from "@/ui/password-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

interface AddUserModalProps {
	open: boolean;
	onClose: () => void;
	companyId: string;
}

interface AddUserForm {
	name: string;
	email: string;
	password?: string;
	role: "customer_admin" | "field_user";
	adminType: "full" | "read_only";
}

interface CreatedCredentials {
	name: string;
	email: string;
	temporaryPassword: string;
}

export function AddUserModal({ open, onClose, companyId }: AddUserModalProps) {
	const queryClient = useQueryClient();
	const [credentials, setCredentials] = useState<CreatedCredentials | null>(null);
	const [copied, setCopied] = useState<"email" | "password" | "all" | null>(null);

	const form = useForm<AddUserForm>({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			role: "field_user",
			adminType: "full",
		},
	});

	const selectedRole = form.watch("role");

	const createUserMutation = useMutation({
		mutationFn: (data: AddUserForm) => adminService.createUser({ ...data, companyId }),
		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({ queryKey: ["admin", "company-users", companyId] });
			queryClient.invalidateQueries({ queryKey: ["admin", "company", companyId] });
			form.reset();
			if (response.temporaryPassword) {
				setCredentials({
					name: variables.name,
					email: variables.email,
					temporaryPassword: response.temporaryPassword,
				});
			} else {
				toast.success("User created successfully");
				onClose();
			}
		},
		onError: () => {
			// Error toast is handled by apiClient
		},
	});

	const handleSubmit = (values: AddUserForm) => {
		const submitData: Record<string, unknown> = {
			name: values.name,
			email: values.email,
			role: values.role,
			adminType: values.role === "customer_admin" ? values.adminType : undefined,
		};
		if (values.password) submitData.password = values.password;
		createUserMutation.mutate(submitData as any);
	};

	const handleClose = () => {
		if (!createUserMutation.isPending) {
			form.reset();
			setCredentials(null);
			setCopied(null);
			onClose();
		}
	};

	const copyToClipboard = async (text: string, type: "email" | "password" | "all") => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(type);
			toast.success("Copied to clipboard");
			setTimeout(() => setCopied(null), 2000);
		} catch {
			toast.error("Failed to copy");
		}
	};

	const copyAllCredentials = () => {
		if (!credentials) return;
		const text = `Name: ${credentials.name}\nEmail: ${credentials.email}\nTemporary Password: ${credentials.temporaryPassword}\n\nNote: User must change password on first login.`;
		copyToClipboard(text, "all");
	};

	if (credentials) {
		return (
			<Dialog open={open} onOpenChange={handleClose}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle className="text-green-600">User Created Successfully!</DialogTitle>
						<DialogDescription>
							Share these credentials with the user. They will be required to change their password on first login.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<Alert>
							<AlertDescription className="text-amber-600">
								⚠️ Save these credentials now. The password cannot be retrieved later.
							</AlertDescription>
						</Alert>

						<div className="space-y-3 bg-muted/50 rounded-lg p-4">
							<div className="flex items-center justify-between">
								<div className="flex-1">
									<p className="text-sm text-muted-foreground">Name</p>
									<p className="font-medium">{credentials.name}</p>
								</div>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex-1">
									<p className="text-sm text-muted-foreground">Email</p>
									<p className="font-mono text-sm">{credentials.email}</p>
								</div>
								<Button variant="ghost" size="icon" onClick={() => copyToClipboard(credentials.email, "email")}>
									{copied === "email" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
								</Button>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex-1">
									<p className="text-sm text-muted-foreground">Temporary Password</p>
									<p className="font-mono text-sm font-bold">{credentials.temporaryPassword}</p>
								</div>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => copyToClipboard(credentials.temporaryPassword, "password")}
								>
									{copied === "password" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
								</Button>
							</div>
						</div>
					</div>

					<DialogFooter className="flex-col sm:flex-row gap-2">
						<Button variant="outline" onClick={copyAllCredentials} className="w-full sm:w-auto">
							{copied === "all" ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
							Copy All Credentials
						</Button>
						<Button onClick={handleClose} className="w-full sm:w-auto">
							Done
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Add User</DialogTitle>
					<DialogDescription>Create a new user for this company. Password is optional.</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							rules={{ required: "Name is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter user's full name" {...field} />
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
								pattern: {
									value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
									message: "Invalid email address",
								},
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input type="email" placeholder="user@example.com" {...field} />
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
									<FormLabel>Password (Optional)</FormLabel>
									<FormControl>
										<PasswordInput placeholder="Leave empty for auto-generated" {...field} />
									</FormControl>
									<FormDescription>If not provided, a temporary password will be generated</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="role"
							rules={{ required: "Role is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Role</FormLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select role" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="field_user">Field User</SelectItem>
											<SelectItem value="customer_admin">Admin</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>Field users work in the field, admins manage the company</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{selectedRole === "customer_admin" && (
							<FormField
								control={form.control}
								name="adminType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Admin Type</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select admin type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="full">Full Admin</SelectItem>
												<SelectItem value="read_only">Read-Only Admin</SelectItem>
											</SelectContent>
										</Select>
										<FormDescription>Read-only admins can only view data, not create/edit/delete</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						<DialogFooter>
							<Button type="button" variant="outline" onClick={handleClose} disabled={createUserMutation.isPending}>
								Cancel
							</Button>
							<Button type="submit" disabled={createUserMutation.isPending}>
								{createUserMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								Create User
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
