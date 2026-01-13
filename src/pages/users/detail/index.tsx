import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { UserRole } from "#/enum";
import userService from "@/api/services/userService";
import { Button } from "@/ui/button";
import { CustomerAdminProfile } from "./components/CustomerAdminProfile";
import { FieldWorkerPerformance } from "./components/FieldWorkerPerformance";

export default function UserDetailsPage() {
	const { userId } = useParams<{ userId: string }>();
	const navigate = useNavigate();

	// Fetch user data to determine role
	const {
		data: user,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["user", userId],
		queryFn: () => userService.getUserById(userId ?? ""),
		enabled: !!userId,
	});

	const handleBack = () => {
		navigate("/users");
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-sm text-muted-foreground">Loading user details...</p>
				</div>
			</div>
		);
	}

	// Error state
	if (error || !user) {
		return (
			<div className="h-full flex flex-col items-center justify-center gap-4">
				<p className="text-destructive">Failed to load user details</p>
				<Button variant="outline" onClick={handleBack}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Users
				</Button>
			</div>
		);
	}

	// Role-based rendering
	const isFieldUser = user.role === UserRole.FIELD_USER;

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header with Back Button */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="sm" onClick={handleBack}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Button>
					<div className="h-6 w-px bg-border" />
					<div>
						<h1 className="text-xl font-semibold">
							{isFieldUser ? "Field Worker Performance Overview" : "Customer Admin Details"}
						</h1>
						<p className="text-sm text-muted-foreground">{user.name}</p>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-auto p-6">
				{isFieldUser ? (
					<FieldWorkerPerformance userId={userId ?? ""} user={user} />
				) : (
					<CustomerAdminProfile user={user} />
				)}
			</div>
		</div>
	);
}
