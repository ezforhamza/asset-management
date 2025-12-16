import { format } from "date-fns";
import { MoreHorizontal, QrCode, Trash2 } from "lucide-react";
import type { Company, QRCode as QRCodeType } from "#/entity";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

interface QRTableProps {
	qrCodes: QRCodeType[];
	companies: Company[];
	isLoading: boolean;
	onRetire?: (qrCode: QRCodeType) => void;
}

const getStatusBadge = (status: string) => {
	switch (status) {
		case "available":
			return (
				<Badge variant="outline" className="text-blue-600 border-blue-600">
					Available
				</Badge>
			);
		case "allocated":
			return (
				<Badge variant="outline" className="text-orange-600 border-orange-600">
					Allocated
				</Badge>
			);
		case "used":
			return (
				<Badge variant="default" className="bg-green-600">
					Used
				</Badge>
			);
		case "retired":
			return <Badge variant="secondary">Retired</Badge>;
		default:
			return <Badge variant="secondary">{status}</Badge>;
	}
};

export function QRTable({ qrCodes, companies, isLoading, onRetire }: QRTableProps) {
	const getCompanyName = (companyId: string | null) => {
		if (!companyId) return "—";
		const company = companies.find((c) => c._id === companyId);
		return company?.companyName || "Unknown";
	};

	if (isLoading) {
		return (
			<div className="rounded-md border h-full overflow-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>QR Code</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Company</TableHead>
							<TableHead>Asset</TableHead>
							<TableHead>Created</TableHead>
							<TableHead className="w-[50px]" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: 8 }).map((_, i) => (
							<TableRow key={i}>
								<TableCell>
									<Skeleton className="h-5 w-28" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-20" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-32" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-24" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-24" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-8 w-8" />
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
			<div className="flex flex-col items-center justify-center h-full text-center">
				<QrCode className="h-12 w-12 text-muted-foreground/50 mb-4" />
				<h3 className="text-lg font-medium">No QR codes found</h3>
				<p className="text-sm text-muted-foreground">Import QR codes to get started.</p>
			</div>
		);
	}

	return (
		<div className="rounded-md border h-full overflow-auto">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>QR Code</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Company</TableHead>
						<TableHead>Asset</TableHead>
						<TableHead>Created</TableHead>
						<TableHead className="w-[50px]" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{qrCodes.map((qr) => (
						<TableRow key={qr._id}>
							<TableCell>
								<div className="flex items-center gap-2">
									<QrCode className="h-4 w-4 text-muted-foreground" />
									<span className="font-mono text-sm">{qr.qrCode}</span>
								</div>
							</TableCell>
							<TableCell>{getStatusBadge(qr.status)}</TableCell>
							<TableCell className="text-sm">{getCompanyName(qr.companyId)}</TableCell>
							<TableCell className="text-sm text-muted-foreground">
								{qr.assetSerialNumber || qr.assetId || "—"}
							</TableCell>
							<TableCell className="text-sm text-muted-foreground">
								{format(new Date(qr.createdAt), "MMM d, yyyy")}
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="h-8 w-8">
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={() => onRetire?.(qr)}
											disabled={qr.status === "retired"}
											className="text-destructive"
										>
											<Trash2 className="h-4 w-4 mr-2" />
											Retire
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
