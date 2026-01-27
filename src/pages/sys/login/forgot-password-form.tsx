import { ArrowLeft, Loader2, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import userService from "@/api/services/userService";
import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/ui/input-otp";
import { PasswordInput } from "@/ui/password-input";
import { cn } from "@/utils";
import { LoginStateEnum, useLoginStateContext } from "./providers/login-provider";

interface EmailFormData {
	email: string;
}

interface PasswordFormData {
	newPassword: string;
	confirmPassword: string;
}

export function ForgotPasswordForm({ className }: React.ComponentPropsWithoutRef<"div">) {
	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState<"email" | "otp-password">("email");
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");

	const { loginState, backToLogin } = useLoginStateContext();

	const emailForm = useForm<EmailFormData>({
		defaultValues: {
			email: "",
		},
	});

	const passwordForm = useForm<PasswordFormData>({
		defaultValues: {
			newPassword: "",
			confirmPassword: "",
		},
	});

	if (loginState !== LoginStateEnum.FORGOT_PASSWORD) return null;

	const handleSendOtp = async (values: EmailFormData) => {
		setLoading(true);
		try {
			await userService.forgotPassword({ email: values.email });
			setEmail(values.email);
			setStep("otp-password");
			toast.success("OTP sent to your email");
		} catch {
			toast.error("Failed to send OTP. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleResetPassword = async (values: PasswordFormData) => {
		if (!otp || otp.length !== 6) {
			toast.error("Please enter a valid 6-digit OTP");
			return;
		}

		if (values.newPassword !== values.confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		setLoading(true);
		try {
			const verifyResponse = await userService.verifyOtp({
				email,
				otp,
			});

			await userService.resetPasswordWithToken({
				resetToken: verifyResponse.resetToken,
				newPassword: values.newPassword,
			});

			toast.success("Password reset successfully! Please login with your new password.");
			backToLogin();
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } } };
			toast.error(err.response?.data?.message || "Failed to reset password. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	if (step === "otp-password") {
		return (
			<div className={cn("flex flex-col gap-6", className)}>
				<div className="flex flex-col items-center gap-2 text-center">
					<div className="rounded-full bg-primary/10 p-4">
						<LockKeyhole className="h-8 w-8 text-primary" />
					</div>
					<h1 className="text-2xl font-bold">Reset Password</h1>
					<p className="text-sm text-muted-foreground">
						We've sent a 6-digit OTP to <span className="font-medium">{email}</span>
					</p>
				</div>

				<div className="space-y-4">
					<div className="space-y-2">
						<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							One-Time Password
						</label>
						<div className="flex justify-center">
							<InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)} autoComplete="one-time-code">
								<InputOTPGroup>
									<InputOTPSlot index={0} />
									<InputOTPSlot index={1} />
									<InputOTPSlot index={2} />
								</InputOTPGroup>
								<InputOTPSeparator />
								<InputOTPGroup>
									<InputOTPSlot index={3} />
									<InputOTPSlot index={4} />
									<InputOTPSlot index={5} />
								</InputOTPGroup>
							</InputOTP>
						</div>
					</div>

					<Form {...passwordForm}>
						<form onSubmit={passwordForm.handleSubmit(handleResetPassword)} className="space-y-4" autoComplete="off">
							<FormField
								control={passwordForm.control}
								name="newPassword"
								rules={{
									required: "Password is required",
									minLength: {
										value: 8,
										message: "Password must be at least 8 characters",
									},
									pattern: {
										value: /^(?=.*[A-Za-z])(?=.*\d).+$/,
										message: "Password must contain at least one letter and one number",
									},
								}}
								render={({ field }) => (
									<FormItem>
										<FormLabel>New Password</FormLabel>
										<FormControl>
											<PasswordInput placeholder="Enter new password" {...field} autoComplete="new-password" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={passwordForm.control}
								name="confirmPassword"
								rules={{
									required: "Confirm password is required",
									validate: (value) => value === passwordForm.watch("newPassword") || "Passwords do not match",
								}}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Confirm Password</FormLabel>
										<FormControl>
											<PasswordInput placeholder="Confirm new password" {...field} autoComplete="new-password" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
								{loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
								Reset Password
							</Button>
						</form>
					</Form>
				</div>

				<Button type="button" variant="ghost" onClick={backToLogin} className="w-full">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Login
				</Button>
			</div>
		);
	}

	return (
		<div className={cn("flex flex-col gap-6", className)}>
			<div className="flex flex-col items-center gap-2 text-center">
				<div className="rounded-full bg-primary/10 p-4">
					<Mail className="h-8 w-8 text-primary" />
				</div>
				<h1 className="text-2xl font-bold">Forgot Password?</h1>
				<p className="text-sm text-muted-foreground">Enter your email and we'll send you a reset OTP</p>
			</div>

			<Form {...emailForm}>
				<form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="space-y-4" autoComplete="off">
					<FormField
						control={emailForm.control}
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
									<Input type="email" placeholder="Enter your email" {...field} autoComplete="email" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full" disabled={loading}>
						{loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
						Send OTP
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
