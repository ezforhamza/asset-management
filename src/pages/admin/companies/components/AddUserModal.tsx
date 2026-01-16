import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import adminService from "@/api/services/adminService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
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

export function AddUserModal({ open, onClose, companyId }: AddUserModalProps) {
	const queryClient = useQueryClient();

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
		onSuccess: (response) => {
			toast.success(
				response.temporaryPassword
					? `User created with temporary password: ${response.temporaryPassword}`
					: "User created successfully",
			);
			queryClient.invalidateQueries({ queryKey: ["admin", "company-users", companyId] });
			queryClient.invalidateQueries({ queryKey: ["admin", "company", companyId] });
			form.reset();
			onClose();
		},
		onError: () => {
			// Error toast is handled by apiClient
		},
	});

	const handleSubmit = (values: AddUserForm) => {
		const submitData = {
			...values,
			adminType: values.role === "customer_admin" ? values.adminType : null,
		};
		createUserMutation.mutate(submitData as any);
	};

	const handleClose = () => {
		if (!createUserMutation.isPending) {
			form.reset();
			onClose();
		}
	};

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
										<Input type="password" placeholder="Leave empty for auto-generated" {...field} />
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
