import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Package } from "lucide-react";
import assetService from "@/api/services/assetService";
import { Badge } from "@/ui/badge";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

interface CompanyAssetsTabProps {
	companyId: string;
}

const getStatusBadge = (status: string) => {
	switch (status) {
		case "active":
			return <Badge className="bg-green-600">Active</Badge>;
		case "retired":
			return <Badge variant="secondary">Retired</Badge>;
		case "transferred":
			return <Badge className="bg-blue-500">Transferred</Badge>;
		default:
			return <Badge variant="outline">{status}</Badge>;
	}
};

export function CompanyAssetsTab({ companyId }: CompanyAssetsTabProps) {
	const { data, isLoading } = useQuery({
		queryKey: ["assets", "company", companyId],
		queryFn: () => assetService.getAssets({ companyId }),
	});

	const assets = data?.results || [];

	if (isLoading) {
		return (
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Serial Number</TableHead>
							<TableHead>Make / Model</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Last Verified</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: 3 }).map((_, i) => (
							<TableRow key={i}>
								<TableCell>
									<Skeleton className="h-5 w-32" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-40" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-20" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-24" />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		);
	}

	if (assets.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
				<h3 className="text-lg font-medium">No assets found</h3>
				<p className="text-sm text-muted-foreground">This company has no registered assets yet.</p>
			</div>
		);
	}

	return (
		<div className="rounded-md border overflow-auto">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Serial Number</TableHead>
						<TableHead>Make / Model</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Last Verified</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{assets.map((asset) => (
						<TableRow key={asset.id}>
							<TableCell className="font-mono">{asset.serialNumber}</TableCell>
							<TableCell>
								{asset.make} {asset.model}
							</TableCell>
							<TableCell>{getStatusBadge(asset.status)}</TableCell>
							<TableCell className="text-sm text-muted-foreground">
								{asset.lastVerifiedAt ? format(new Date(asset.lastVerifiedAt), "MMM d, yyyy") : "Never"}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
