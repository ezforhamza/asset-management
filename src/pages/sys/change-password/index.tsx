import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

import userService, { type ChangePasswordReq } from "@/api/services/userService";
import { GLOBAL_CONFIG } from "@/global-config";
import { useUserActions } from "@/store/userStore";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

interface ChangePasswordForm extends ChangePasswordReq {
	confirmPassword: string;
}

export default function ChangePasswordPage() {
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { setUserInfo } = useUserActions();

	const form = useForm<ChangePasswordForm>({
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const handleSubmit = async (values: ChangePasswordForm) => {
		if (values.newPassword !== values.confirmPassword) {
			form.setError("confirmPassword", { message: "Passwords do not match" });
			return;
		}

		setLoading(true);
		try {
			await userService.changePassword({
				currentPassword: values.currentPassword,
				newPassword: values.newPassword,
			});

			setUserInfo({ mustChangePassword: false } as any);
			toast.success("Password changed successfully");
			navigate(GLOBAL_CONFIG.defaultRoute, { replace: true });
		} catch {
			toast.error("Failed to change password");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 rounded-full bg-primary/10 p-3 w-fit">
						<Lock className="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Change Your Password</CardTitle>
					<CardDescription>For security, please change your temporary password</CardDescription>
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
											<Input type="password" placeholder="Enter current password" {...field} />
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
									minLength: { value: 8, message: "Password must be at least 8 characters" },
									pattern: {
										value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
										message: "Password must contain uppercase, lowercase, and number",
									},
								}}
								render={({ field }) => (
									<FormItem>
										<FormLabel>New Password</FormLabel>
										<FormControl>
											<Input type="password" placeholder="Enter new password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="confirmPassword"
								rules={{ required: "Please confirm your password" }}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Confirm Password</FormLabel>
										<FormControl>
											<Input type="password" placeholder="Confirm new password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="text-xs text-muted-foreground space-y-1">
								<p>Password requirements:</p>
								<ul className="list-disc list-inside">
									<li>Minimum 8 characters</li>
									<li>At least 1 uppercase letter</li>
									<li>At least 1 number</li>
								</ul>
							</div>

							<Button type="submit" className="w-full" disabled={loading}>
								{loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
								Change Password
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
