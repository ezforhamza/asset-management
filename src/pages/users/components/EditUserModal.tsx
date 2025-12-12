import { Loader2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { UserInfo } from "#/entity";
import userService from "@/api/services/userService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

interface EditUserModalProps {
	user: UserInfo | null;
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

interface EditUserForm {
	name: string;
	email: string;
	role: string;
}

export function EditUserModal({ user, open, onClose, onSuccess }: EditUserModalProps) {
	const [loading, setLoading] = useState(false);

	const form = useForm<EditUserForm>({
		defaultValues: {
			name: "",
			email: "",
			role: "field_user",
		},
	});

	useEffect(() => {
		if (user) {
			form.reset({
				name: user.name || "",
				email: user.email || "",
				role: user.role || "field_user",
			});
		}
	}, [user, form]);

	const handleSubmit = async (values: EditUserForm) => {
		if (!user?.id) return;

		setLoading(true);
		try {
			await userService.updateUser(user.id, {
				name: values.name,
				role: values.role as "field_user" | "customer_admin",
			});

			toast.success("User updated successfully");
			onSuccess();
			onClose();
		} catch {
			toast.error("Failed to update user");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Edit User
					</DialogTitle>
					<DialogDescription>Update user details and permissions</DialogDescription>
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
										<Input placeholder="John Doe" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email Address</FormLabel>
									<FormControl>
										<Input type="email" disabled {...field} />
									</FormControl>
									<p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Role</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
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
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex gap-3 pt-2">
							<Button type="button" variant="outline" onClick={onClose} className="flex-1">
								Cancel
							</Button>
							<Button type="submit" disabled={loading} className="flex-1">
								{loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								Save Changes
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export default EditUserModal;
