import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { useState } from "react";
import type { Asset } from "#/entity";
import allocationService from "@/api/services/allocationService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

interface FieldWorkerAssetsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	fieldWorkerId: string;
	fieldWorkerName: string;
}

export function FieldWorkerAssetsModal({
	open,
	onOpenChange,
	fieldWorkerId,
	fieldWorkerName,
}: FieldWorkerAssetsModalProps) {
	const [page, setPage] = useState(1);
	const limit = 10;

	const { data, isLoading } = useQuery({
		queryKey: ["field-worker-assets", fieldWorkerId, page],
		queryFn: () => allocationService.getFieldWorkerAssets(fieldWorkerId, { page, limit }),
		enabled: open,
	});

	const assets = data?.results || [];
	const totalPages = data?.totalPages || 1;
	const totalResults = data?.totalResults || 0;

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return <Badge variant="default">Active</Badge>;
			case "retired":
				return <Badge variant="secondary">Retired</Badge>;
			case "transferred":
				return <Badge variant="outline">Transferred</Badge>;
			default:
				return <Badge variant="secondary">{status}</Badge>;
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[80vh]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Package className="h-5 w-5" />
						Allocated Assets - {fieldWorkerName}
					</DialogTitle>
					<DialogDescription>
						{isLoading
							? "Loading..."
							: `${totalResults} asset${totalResults !== 1 ? "s" : ""} allocated to this worker`}
					</DialogDescription>
				</DialogHeader>

				<div className="rounded-md border max-h-[50vh] overflow-auto">
					<Table>
						<TableHeader className="sticky top-0 bg-background">
							<TableRow>
								<TableHead>Serial Number</TableHead>
								<TableHead>Make / Model</TableHead>
								<TableHead>Category</TableHead>
								<TableHead>Site Name</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								Array.from({ length: 5 }).map((_, i) => (
									<TableRow key={`skeleton-${i}`}>
										<TableCell>
											<Skeleton className="h-4 w-24" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-32" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-20" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-20" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-5 w-16" />
										</TableCell>
									</TableRow>
								))
							) : assets.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
										No assets allocated to this field worker
									</TableCell>
								</TableRow>
							) : (
								assets.map((asset: Asset) => (
									<TableRow key={asset.id || asset._id}>
										<TableCell className="font-mono text-sm">{asset.serialNumber}</TableCell>
										<TableCell>
											{asset.make} {asset.model}
										</TableCell>
										<TableCell className="text-muted-foreground">{asset.category?.name || "—"}</TableCell>
										<TableCell className="text-muted-foreground">{asset.siteName || "—"}</TableCell>
										<TableCell>{getStatusBadge(asset.status)}</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>

				{/* Pagination */}
				{!isLoading && totalPages > 1 && (
					<div className="flex items-center justify-between pt-2">
						<p className="text-sm text-muted-foreground">
							Page {page} of {totalPages}
						</p>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page === 1}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								disabled={page === totalPages}
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
