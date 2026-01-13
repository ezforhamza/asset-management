import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useAuthStatus, useUserActions } from "@/store/userStore";
import { useRouter } from "../hooks";

type Props = {
	children: React.ReactNode;
};

export default function LoginAuthGuard({ children }: Props) {
	const router = useRouter();
	const authStatus = useAuthStatus();
	const { initializeAuth, setAuthStatus } = useUserActions();
	const initialized = useRef(false);

	// Initialize auth only once on mount - intentionally no deps to prevent infinite loop
	// biome-ignore lint/correctness/useExhaustiveDependencies: initializeAuth causes re-render loop if included
	useEffect(() => {
		if (!initialized.current) {
			initialized.current = true;
			initializeAuth();
		}
	}, []);

	// Timeout to prevent infinite loading - if still loading after 5 seconds, force unauthenticated
	useEffect(() => {
		if (authStatus === "loading") {
			const timeout = setTimeout(() => {
				console.warn("Auth validation timeout - redirecting to login");
				setAuthStatus("unauthenticated");
			}, 5000);
			return () => clearTimeout(timeout);
		}
	}, [authStatus, setAuthStatus]);

	// Redirect when auth is resolved and unauthenticated
	useEffect(() => {
		if (authStatus === "unauthenticated") {
			router.replace("/auth/login");
		}
	}, [authStatus, router]);

	// Show loading state while auth is being validated
	if (authStatus === "loading") {
		return (
			<div className="h-screen w-screen flex items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-sm text-muted-foreground">Validating session...</p>
				</div>
			</div>
		);
	}

	// Don't render children if not authenticated
	if (authStatus !== "authenticated") {
		return null;
	}

	return <>{children}</>;
}
