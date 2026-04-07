import { Navigate } from "react-router";
import { UserRole } from "#/enum";
import { Icon } from "@/components/icon";
import Logo from "@/components/logo";
import SettingButton from "@/layouts/components/setting-button";
import { useUserInfo, useUserToken } from "@/store/userStore";
import ForgotPasswordForm from "./forgot-password-form";
import { LoginForm } from "./login-form";
import { LoginProvider } from "./providers/login-provider";

function AdminLoginPage() {
	const token = useUserToken();
	const userInfo = useUserInfo();

	if (token.accessToken && userInfo.role === UserRole.SYSTEM_ADMIN) {
		return <Navigate to="/admin/dashboard" replace />;
	}

	return (
		<div className="relative grid min-h-svh lg:grid-cols-2 bg-background">
			{/* Left Side - Form */}
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<Logo size={56} showTitle titleClassName="text-2xl" className="cursor-pointer" />
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-sm">
						<LoginProvider>
							<LoginForm expectedRole={UserRole.SYSTEM_ADMIN} redirectTo="/admin/dashboard" />
							<ForgotPasswordForm />
						</LoginProvider>
					</div>
				</div>
			</div>

			{/* Right Side - Hero Section */}
			<div className="relative hidden bg-gradient-to-br from-primary/90 to-primary lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
				<div className="text-center text-white">
					<Icon icon="solar:shield-keyhole-bold-duotone" className="h-24 w-24 mx-auto mb-6 opacity-90" />
					<h2 className="text-3xl font-bold mb-4">System Administration</h2>
					<p className="text-lg opacity-80 max-w-md">
						Manage companies, users, and system-wide configurations from a centralized admin portal.
					</p>
					<div className="mt-8 grid grid-cols-3 gap-6 text-center">
						<div>
							<div className="text-3xl font-bold">100%</div>
							<div className="text-sm opacity-70">Control</div>
						</div>
						<div>
							<div className="text-3xl font-bold">Live</div>
							<div className="text-sm opacity-70">Monitoring</div>
						</div>
						<div>
							<div className="text-3xl font-bold">Full</div>
							<div className="text-sm opacity-70">Access</div>
						</div>
					</div>
				</div>
			</div>

			{/* Settings Button */}
			<div className="absolute right-2 top-2">
				<SettingButton />
			</div>
		</div>
	);
}

export default AdminLoginPage;
