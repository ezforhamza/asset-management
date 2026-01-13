import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { UserRole } from "#/enum";
import type { SignInReq } from "@/api/services/userService";
import { GLOBAL_CONFIG } from "@/global-config";
import { useSignIn, useUserActions } from "@/store/userStore";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { cn } from "@/utils";
import { LoginStateEnum, useLoginStateContext } from "./providers/login-provider";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"form">) {
	const [loading, setLoading] = useState(false);
	const [remember, setRemember] = useState(true);
	const navigate = useNavigate();

	const { loginState, setLoginState } = useLoginStateContext();
	const signIn = useSignIn();
	const { clearUserInfoAndToken } = useUserActions();

	const form = useForm<SignInReq>({
		defaultValues: {
			email: "",
			password: "",
		},
	});

	if (loginState !== LoginStateEnum.LOGIN) return null;

	const handleFinish = async (values: SignInReq) => {
		setLoading(true);
		try {
			const result = await signIn(values);

			if (!result) {
				// Login failed - error already shown by signIn
				return;
			}

			// Block field_user from accessing web dashboard
			if (result.role === UserRole.FIELD_USER) {
				clearUserInfoAndToken();
				toast.error("Field users can only access the mobile app. Please use the mobile application.", {
					position: "top-center",
					duration: 5000,
				});
				return;
			}

			if (result.mustChangePassword) {
				navigate("/change-password", { replace: true });
				return;
			}

			// Redirect based on user role
			const redirectPath = result.role === UserRole.SYSTEM_ADMIN ? "/admin/dashboard" : GLOBAL_CONFIG.defaultRoute;
			navigate(redirectPath, { replace: true });
			toast.success("Welcome back!", { closeButton: true });
		} catch {
			// Error already handled in signIn
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)}>
			<Form {...form} {...props}>
				<form onSubmit={form.handleSubmit(handleFinish)} className="space-y-5">
					<div className="flex flex-col items-center gap-2 text-center">
						<h1 className="text-2xl font-bold">Welcome Back</h1>
						<p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
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

					<FormField
						control={form.control}
						name="password"
						rules={{ required: "Password is required" }}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input type="password" placeholder="Enter your password" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="flex flex-row justify-between items-center">
						<div className="flex items-center space-x-2">
							<Checkbox
								id="remember"
								checked={remember}
								onCheckedChange={(checked) => setRemember(checked === "indeterminate" ? false : checked)}
							/>
							<label
								htmlFor="remember"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Remember me
							</label>
						</div>
						<Button
							type="button"
							variant="link"
							onClick={() => setLoginState(LoginStateEnum.FORGOT_PASSWORD)}
							className="px-0 text-sm"
						>
							Forgot password?
						</Button>
					</div>

					<Button type="submit" className="w-full" size="lg" disabled={loading}>
						{loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
						Sign In
					</Button>
				</form>
			</Form>
		</div>
	);
}

export default LoginForm;
