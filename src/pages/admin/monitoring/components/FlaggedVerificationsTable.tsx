// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertTriangle, ExternalLink } from "lucide-react";
import adminService from "@/api/services/adminService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

const getStatusBadge = (status: string | null) => {
	switch (status) {
		case "open":
			return <Badge variant="destructive">Open</Badge>;
		case "investigating":
			return (
				<Badge variant="outline" className="text-orange-600 border-orange-600">
					Investigating
				</Badge>
			);
		case "resolved":
			return (
				<Badge variant="default" className="bg-green-600">
					Resolved
				</Badge>
			);
		default:
			return <Badge variant="secondary">Unknown</Badge>;
	}
};

export function FlaggedVerificationsTable() {
	const { data, isLoading } = useQuery({
		queryKey: ["admin", "flagged-verifications"],
		queryFn: () => adminService.getFlaggedVerifications({ limit: 5 }),
	});

	const verifications = (data?.verifications || []) as Array<{
		_id: string;
		assetId: string;
		verifiedAt: string;
		distanceFromAsset: number;
		investigationStatus: string | null;
		asset?: { serialNumber: string };
	}>;

	if (isLoading) {
		return (
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Asset</TableHead>
						<TableHead>Date</TableHead>
						<TableHead>Distance</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className="w-[80px]" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 3 }).map((_, i) => (
						<TableRow key={i}>
							<TableCell>
								<Skeleton className="h-5 w-28" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-5 w-24" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-5 w-16" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-5 w-20" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-8 w-8" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		);
	}

	if (verifications.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-center">
				<AlertTriangle className="h-10 w-10 text-green-500 mb-3" />
				<h3 className="text-lg font-medium">No flagged verifications</h3>
				<p className="text-sm text-muted-foreground">All verifications are within normal parameters.</p>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Asset</TableHead>
					<TableHead>Date</TableHead>
					<TableHead>Distance</TableHead>
					<TableHead>Status</TableHead>
					<TableHead className="w-[80px]" />
				</TableRow>
			</TableHeader>
			<TableBody>
				{verifications.map((v) => (
					<TableRow key={v._id}>
						<TableCell className="font-mono text-sm">{v.asset?.serialNumber || v.assetId}</TableCell>
						<TableCell className="text-sm">{format(new Date(v.verifiedAt), "MMM d, HH:mm")}</TableCell>
						<TableCell>
							<span className="text-sm text-destructive font-medium">{v.distanceFromAsset}m</span>
						</TableCell>
						<TableCell>{getStatusBadge(v.investigationStatus)}</TableCell>
						<TableCell>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<ExternalLink className="h-4 w-4" />
							</Button>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
