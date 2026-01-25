import { CheckCircle, KeyRound, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

import Logo from "@/components/logo";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { PasswordInput } from "@/ui/password-input";

interface ResetPasswordForm {
	password: string;
	confirmPassword: string;
}

export default function ResetPasswordPage() {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const navigate = useNavigate();

	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const form = useForm<ResetPasswordForm>({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	useEffect(() => {
		if (!token) {
			setError("Invalid or expired reset link");
		}
	}, [token]);

	const handleSubmit = async (values: ResetPasswordForm) => {
		if (values.password !== values.confirmPassword) {
			form.setError("confirmPassword", { message: "Passwords do not match" });
			return;
		}

		if (!token) {
			setError("Invalid or expired reset link");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await fetch("https://assetguard.codecoytechnologies.live/v1/auth/reset-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token,
					password: values.password,
				}),
			});

			if (response.status === 204) {
				setSuccess(true);
				toast.success("Password reset successfully!");
				setTimeout(() => {
					navigate("/login", { replace: true });
				}, 2000);
			} else if (response.status === 401) {
				setError("Invalid or expired reset link. Please request a new one.");
			} else {
				setError("Something went wrong. Please try again.");
			}
		} catch {
			setError("Network error. Please check your connection and try again.");
		} finally {
			setLoading(false);
		}
	};

	// No token - show error state
	if (!token) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
				<Logo size={56} showTitle titleClassName="text-2xl" className="cursor-pointer mb-8" />
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 rounded-full bg-destructive/10 p-3 w-fit">
							<XCircle className="h-6 w-6 text-destructive" />
						</div>
						<CardTitle>Invalid Reset Link</CardTitle>
						<CardDescription>Invalid or expired reset link</CardDescription>
					</CardHeader>
					<CardContent>
						<Button onClick={() => navigate("/login")} className="w-full">
							Back to Login
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Success state
	if (success) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
				<Logo size={56} showTitle titleClassName="text-2xl" className="cursor-pointer mb-8" />
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 rounded-full bg-green-500/10 p-3 w-fit">
							<CheckCircle className="h-6 w-6 text-green-500" />
						</div>
						<CardTitle>Password Reset Successful</CardTitle>
						<CardDescription>Your password has been reset. Redirecting to login...</CardDescription>
					</CardHeader>
					<CardContent>
						<Button onClick={() => navigate("/login", { replace: true })} className="w-full">
							Go to Login
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Form state
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
			<Logo size={56} showTitle titleClassName="text-2xl" className="cursor-pointer mb-8" />
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 rounded-full bg-primary/10 p-3 w-fit">
						<KeyRound className="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Reset Your Password</CardTitle>
					<CardDescription>Enter your new password below</CardDescription>
				</CardHeader>
				<CardContent>
					{error && (
						<div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2">
							<XCircle className="h-4 w-4 flex-shrink-0" />
							{error}
						</div>
					)}
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="password"
								rules={{
									required: "Password is required",
									minLength: { value: 8, message: "Password must be at least 8 characters" },
								}}
								render={({ field }) => (
									<FormItem>
										<FormLabel>New Password</FormLabel>
										<FormControl>
											<PasswordInput placeholder="Enter new password" {...field} />
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
											<PasswordInput placeholder="Confirm new password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="text-xs text-muted-foreground">
								<p>Password must be at least 8 characters long.</p>
							</div>

							<Button type="submit" className="w-full" disabled={loading}>
								{loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
								Reset Password
							</Button>

							<Button type="button" variant="ghost" onClick={() => navigate("/login")} className="w-full">
								Back to Login
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
