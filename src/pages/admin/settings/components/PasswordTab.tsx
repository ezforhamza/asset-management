import { useMutation } from "@tanstack/react-query";
import { Key, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import userService from "@/api/services/userService";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { PasswordInput } from "@/ui/password-input";

interface PasswordForm {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}

export function PasswordTab() {
	const form = useForm<PasswordForm>({
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const passwordMutation = useMutation({
		mutationFn: (data: { currentPassword: string; newPassword: string }) => userService.changePassword(data),
		onSuccess: () => {
			toast.success("Password changed successfully");
			form.reset();
		},
		onError: () => {
			// Error toast is handled by apiClient
		},
	});

	const handleSubmit = (values: PasswordForm) => {
		if (values.newPassword !== values.confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}
		passwordMutation.mutate({
			currentPassword: values.currentPassword,
			newPassword: values.newPassword,
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Key className="h-5 w-5" />
					Change Password
				</CardTitle>
				<CardDescription>Update your password to keep your account secure</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="currentPassword"
							rules={{ required: "Current password is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Current Password</FormLabel>
									<FormControl>
										<PasswordInput placeholder="Enter current password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="newPassword"
							rules={{
								required: "New password is required",
								minLength: {
									value: 8,
									message: "Password must be at least 8 characters",
								},
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>New Password</FormLabel>
									<FormControl>
										<PasswordInput placeholder="Enter new password" {...field} />
									</FormControl>
									<FormDescription>Must be at least 8 characters long</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="confirmPassword"
							rules={{
								required: "Please confirm your password",
								validate: (value) => value === form.getValues("newPassword") || "Passwords do not match",
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Confirm New Password</FormLabel>
									<FormControl>
										<PasswordInput placeholder="Confirm new password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end pt-4">
							<Button type="submit" disabled={passwordMutation.isPending}>
								<Save className="h-4 w-4 mr-2" />
								{passwordMutation.isPending ? "Changing..." : "Change Password"}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
