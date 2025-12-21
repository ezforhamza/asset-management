import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { QrCode } from "lucide-react";
import adminService from "@/api/services/adminService";
import { Badge } from "@/ui/badge";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

interface CompanyQRCodesTabProps {
	companyId: string;
}

const getStatusBadge = (status: string) => {
	switch (status) {
		case "active":
			return <Badge className="bg-green-600">Active</Badge>;
		case "linked":
			return <Badge className="bg-blue-600">Linked</Badge>;
		case "retired":
			return <Badge variant="secondary">Retired</Badge>;
		default:
			return <Badge variant="outline">{status}</Badge>;
	}
};

export function CompanyQRCodesTab({ companyId }: CompanyQRCodesTabProps) {
	const { data, isLoading } = useQuery({
		queryKey: ["admin", "company-qrcodes", companyId],
		queryFn: () => adminService.getAdminQRCodes({ companyId }),
	});

	const qrCodes = data?.results || [];

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
		<div className="rounded-md border overflow-auto">
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
									<span className="text-primary">
										{typeof qr.assetId === "object" ? qr.assetId.serialNumber : qr.assetId}
									</span>
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
	);
}
