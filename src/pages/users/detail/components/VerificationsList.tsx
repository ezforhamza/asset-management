import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Loader2 } from "lucide-react";
import verificationService from "@/api/services/verificationService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { VerificationCard } from "./VerificationCard";

interface VerificationsListProps {
	userId: string;
}

export function VerificationsList({ userId }: VerificationsListProps) {
	const { data, isLoading, error } = useQuery({
		queryKey: ["user-verifications", userId],
		queryFn: () => verificationService.getVerificationsByUser(userId, { limit: 50 }),
		enabled: !!userId,
	});

	if (isLoading) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center py-12 gap-2">
					<p className="text-destructive">Failed to load verifications</p>
				</CardContent>
			</Card>
		);
	}

	const verifications = data?.results || [];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ClipboardList className="h-5 w-5" />
					Verification History
				</CardTitle>
				<CardDescription>
					{verifications.length > 0
						? `${data?.totalResults || verifications.length} verification${verifications.length !== 1 ? "s" : ""} performed by this field worker`
						: "No verifications performed yet"}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{verifications.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<ClipboardList className="h-12 w-12 text-muted-foreground mb-3" />
						<p className="text-muted-foreground">This field worker hasn't performed any verifications yet.</p>
					</div>
				) : (
					<div className="space-y-4">
						{verifications.map((verification) => (
							<VerificationCard key={verification.id} verification={verification} />
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export default VerificationsList;
