import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Package } from "lucide-react";
import { useState } from "react";
import assetService from "@/api/services/assetService";
import { Button } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { StyledBadge } from "@/utils/badge-styles";

interface CompanyAssetsTabProps {
	companyId: string;
}

const getStatusBadge = (status: string) => {
	switch (status) {
		case "active":
			return <StyledBadge color="emerald">Active</StyledBadge>;
		case "retired":
			return <StyledBadge color="gray">Retired</StyledBadge>;
		case "transferred":
			return <StyledBadge color="blue">Transferred</StyledBadge>;
		default:
			return <StyledBadge color="gray">{status}</StyledBadge>;
	}
};

const ROWS_PER_PAGE = 6;

export function CompanyAssetsTab({ companyId }: CompanyAssetsTabProps) {
	const [currentPage, setCurrentPage] = useState(1);

	const { data, isLoading } = useQuery({
		queryKey: ["assets", "company", companyId, currentPage],
		queryFn: () => assetService.getAssets({ companyId, page: currentPage, limit: ROWS_PER_PAGE }),
	});

	const assets = data?.results || [];
	const totalResults = data?.totalResults || 0;
	const totalPages = data?.totalPages || 1;
	const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
	const endIndex = Math.min(startIndex + ROWS_PER_PAGE, totalResults);

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
		<div className="rounded-md border flex flex-col">
			<div className="overflow-auto">
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
								<TableCell className="font-mono">
									{asset.serialNumber || <span className="text-muted-foreground italic text-xs">Not added yet</span>}
								</TableCell>
								<TableCell>
									{asset.make || asset.model ? (
										<>
											{asset.make} {asset.model}
										</>
									) : (
										<span className="text-muted-foreground italic text-xs">Not added yet</span>
									)}
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
			{totalPages > 1 && (
				<div className="flex items-center justify-between px-4 py-3 border-t">
					<div className="text-sm text-muted-foreground">
						Showing {startIndex + 1} to {Math.min(endIndex, totalResults)} of {totalResults} results
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage((prev) => prev - 1)}
							disabled={currentPage === 1}
						>
							Previous
						</Button>
						<span className="text-sm">
							Page {currentPage} of {totalPages}
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage((prev) => prev + 1)}
							disabled={currentPage === totalPages}
						>
							Next
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
