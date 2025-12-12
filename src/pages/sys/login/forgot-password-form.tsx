import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

import userService, { type ForgotPasswordReq } from "@/api/services/userService";
import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { cn } from "@/utils";
import { toast } from "sonner";
import { LoginStateEnum, useLoginStateContext } from "./providers/login-provider";

export function ForgotPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<"form">) {
	const [loading, setLoading] = useState(false);
	const [emailSent, setEmailSent] = useState(false);

	const { loginState, backToLogin } = useLoginStateContext();

	const form = useForm<ForgotPasswordReq>({
		defaultValues: {
			email: "",
		},
	});

	if (loginState !== LoginStateEnum.FORGOT_PASSWORD) return null;

	const handleSubmit = async (values: ForgotPasswordReq) => {
		setLoading(true);
		try {
			await userService.forgotPassword(values);
			setEmailSent(true);
			toast.success("Password reset link sent to your email");
		} catch {
			toast.error("Failed to send reset link. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	if (emailSent) {
		return (
			<div className={cn("flex flex-col gap-6", className)}>
				<div className="flex flex-col items-center gap-4 text-center">
					<div className="rounded-full bg-primary/10 p-4">
						<Mail className="h-8 w-8 text-primary" />
					</div>
					<h1 className="text-2xl font-bold">Check Your Email</h1>
					<p className="text-muted-foreground">
						We've sent a password reset link to your email address. Please check your inbox.
					</p>
				</div>
				<Button variant="outline" onClick={backToLogin} className="w-full">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Login
				</Button>
			</div>
		);
	}

	return (
		<div className={cn("flex flex-col gap-6", className)}>
			<Form {...form} {...props}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
					<div className="flex flex-col items-center gap-2 text-center">
						<h1 className="text-2xl font-bold">Forgot Password?</h1>
						<p className="text-sm text-muted-foreground">Enter your email and we'll send you a reset link</p>
					</div>

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
									<Input type="email" placeholder="Enter your email" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full" disabled={loading}>
						{loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
						Send Reset Link
					</Button>

					<Button type="button" variant="ghost" onClick={backToLogin} className="w-full">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Login
					</Button>
				</form>
			</Form>
		</div>
	);
}

export default ForgotPasswordForm;
