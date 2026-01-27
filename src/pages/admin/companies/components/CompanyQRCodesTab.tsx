import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { QrCode } from "lucide-react";
import { useState } from "react";
import adminService from "@/api/services/adminService";
import { Button } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { StyledBadge } from "@/utils/badge-styles";

interface CompanyQRCodesTabProps {
	companyId: string;
}

const getStatusBadge = (status: string) => {
	switch (status) {
		case "available":
			return <StyledBadge color="blue">Available</StyledBadge>;
		case "allocated":
			return <StyledBadge color="orange">Allocated</StyledBadge>;
		case "used":
			return <StyledBadge color="emerald">Used</StyledBadge>;
		case "retired":
			return <StyledBadge color="gray">Retired</StyledBadge>;
		default:
			return <StyledBadge color="gray">{status}</StyledBadge>;
	}
};

const ROWS_PER_PAGE = 6;

export function CompanyQRCodesTab({ companyId }: CompanyQRCodesTabProps) {
	const [currentPage, setCurrentPage] = useState(1);

	const { data, isLoading } = useQuery({
		queryKey: ["admin", "company-qrcodes", companyId, currentPage],
		queryFn: () => adminService.getAdminQRCodes({ companyId, page: currentPage, limit: ROWS_PER_PAGE }),
	});

	const qrCodes = data?.results || [];
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
							<TableHead>QR Code</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Linked Asset</TableHead>
							<TableHead>Allocated</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: 3 }).map((_, i) => (
							<TableRow key={i}>
								<TableCell>
									<Skeleton className="h-5 w-32" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-20" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-40" />
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

	if (qrCodes.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<QrCode className="h-12 w-12 text-muted-foreground/50 mb-4" />
				<h3 className="text-lg font-medium">No QR codes allocated</h3>
				<p className="text-sm text-muted-foreground">This company has no QR codes allocated yet.</p>
			</div>
		);
	}

	return (
		<div className="rounded-md border flex flex-col">
			<div className="overflow-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>QR Code</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Linked Asset</TableHead>
							<TableHead>Allocated</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{qrCodes.map((qr) => (
							<TableRow key={qr.id}>
								<TableCell className="font-mono text-sm">{qr.qrCode}</TableCell>
								<TableCell>{getStatusBadge(qr.status)}</TableCell>
								<TableCell className="text-sm">
									{qr.assetId ? (
										typeof qr.assetId === "object" && qr.assetId.serialNumber ? (
											<span className="text-primary">{qr.assetId.serialNumber}</span>
										) : typeof qr.assetId === "object" ? (
											<span className="text-muted-foreground italic text-xs">Asset details not added</span>
										) : (
											<span className="text-primary">{qr.assetId}</span>
										)
									) : (
										<span className="text-muted-foreground">Not linked</span>
									)}
								</TableCell>
								<TableCell className="text-sm text-muted-foreground">
									{qr.allocatedAt ? format(new Date(qr.allocatedAt), "MMM d, yyyy") : "—"}
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
