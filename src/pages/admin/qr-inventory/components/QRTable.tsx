import { format } from "date-fns";
import { Archive, Eye, MoreHorizontal, QrCode, Trash2 } from "lucide-react";
import type { Company, QRCode as QRCodeType } from "#/entity";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

interface QRTableProps {
	qrCodes: QRCodeType[];
	companies: Company[];
	isLoading: boolean;
	pagination?: {
		page: number;
		limit: number;
		totalPages: number;
		totalResults: number;
	};
	onPageChange?: (page: number) => void;
	onDelete?: (qrCode: QRCodeType) => void;
	onView?: (qrCode: QRCodeType) => void;
	onRetire?: (qrCode: QRCodeType) => void;
	selectedIds?: Set<string>;
	onSelectionChange?: (selectedIds: Set<string>) => void;
	enableSelection?: boolean;
}

const getStatusBadge = (status: string) => {
	switch (status) {
		case "available":
			return (
				<Badge className="bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700">
					Available
				</Badge>
			);
		case "allocated":
			return (
				<Badge className="bg-orange-100 text-orange-700 border border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-700">
					Allocated
				</Badge>
			);
		case "used":
			return (
				<Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700">
					Used
				</Badge>
			);
		case "retired":
			return (
				<Badge className="bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
					Retired
				</Badge>
			);
		default:
			return (
				<Badge className="bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
					{status}
				</Badge>
			);
	}
};

/**
 * Get the Asset column display value based on QR status and asset linkage.
 * Returns either the serial number or a descriptive message.
 */
const getAssetDisplay = (qr: QRCodeType): { text: string; isMuted: boolean } => {
	const status = qr.status;
	const assetId = qr.assetId;
	const assetSerialNumber = qr.assetSerialNumber;

	// Extract serial number from asset object or string
	const getSerialNumber = (): string | null => {
		if (typeof assetId === "object" && assetId) {
			return assetId.serialNumber || null;
		}
		if (assetSerialNumber) {
			return assetSerialNumber;
		}
		if (typeof assetId === "string" && assetId) {
			return assetId;
		}
		return null;
	};

	const hasAsset = assetId !== null && assetId !== undefined;
	const serialNumber = getSerialNumber();

	// 1) QR STATUS = "used" AND asset is linked
	if (status === "used" && hasAsset) {
		if (serialNumber) {
			return { text: serialNumber, isMuted: false };
		}
		return { text: "S.No not added", isMuted: true };
	}

	// 2) QR STATUS = "allocated" AND asset NOT linked
	if (status === "allocated" && !hasAsset) {
		return { text: "Not linked yet", isMuted: true };
	}

	// 3) QR STATUS = "available"
	if (status === "available") {
		return { text: "Not allocated yet", isMuted: true };
	}

	// 4) QR STATUS = "retired"
	if (status === "retired") {
		return { text: "Retired", isMuted: true };
	}

	// Handle edge case: allocated with asset (shouldn't normally happen but handle gracefully)
	if (status === "allocated" && hasAsset) {
		if (serialNumber) {
			return { text: serialNumber, isMuted: false };
		}
		return { text: "S.No not added", isMuted: true };
	}

	// 5) FALLBACK (Safety Net)
	return { text: "—", isMuted: true };
};

export function QRTable({
	qrCodes,
	companies,
	isLoading,
	pagination,
	onPageChange,
	onDelete,
	onView,
	onRetire,
	selectedIds = new Set(),
	onSelectionChange,
	enableSelection = false,
}: QRTableProps) {
	const getQRId = (qr: QRCodeType) => qr.id || qr._id || "";

	const allSelected = qrCodes.length > 0 && qrCodes.every((qr) => selectedIds.has(getQRId(qr)));
	const someSelected = qrCodes.some((qr) => selectedIds.has(getQRId(qr))) && !allSelected;

	const handleSelectAll = (checked: boolean) => {
		if (!onSelectionChange) return;
		const newSelected = new Set(selectedIds);
		if (checked) {
			qrCodes.forEach((qr) => newSelected.add(getQRId(qr)));
		} else {
			qrCodes.forEach((qr) => newSelected.delete(getQRId(qr)));
		}
		onSelectionChange(newSelected);
	};

	const handleSelectOne = (qr: QRCodeType, checked: boolean) => {
		if (!onSelectionChange) return;
		const newSelected = new Set(selectedIds);
		if (checked) {
			newSelected.add(getQRId(qr));
		} else {
			newSelected.delete(getQRId(qr));
		}
		onSelectionChange(newSelected);
	};
	const getCompanyName = (companyId: string | { id: string; companyName: string } | null) => {
		if (!companyId) return "—";
		if (typeof companyId === "object") return companyId.companyName;
		const company = companies.find((c) => c._id === companyId);
		return company?.companyName || "Unknown";
	};

	if (isLoading) {
		return (
			<div className="rounded-md border h-full overflow-auto">
				<Table>
					<TableHeader>
						<TableRow>
							{enableSelection && <TableHead className="w-[50px]" />}
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
								{enableSelection && (
									<TableCell>
										<Skeleton className="h-4 w-4" />
									</TableCell>
								)}
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
		<div className="rounded-md border flex flex-col" style={{ height: "calc(100vh - 280px)" }}>
			<div className="flex-1 overflow-auto">
				<Table>
					<TableHeader>
						<TableRow>
							{enableSelection && (
								<TableHead className="w-[50px]">
									<Checkbox
										checked={allSelected ? true : someSelected ? "indeterminate" : false}
										onCheckedChange={(checked) => handleSelectAll(checked === true)}
										aria-label="Select all"
									/>
								</TableHead>
							)}
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
							<TableRow key={qr.id || qr._id} data-selected={selectedIds.has(getQRId(qr))}>
								{enableSelection && (
									<TableCell>
										<Checkbox
											checked={selectedIds.has(getQRId(qr))}
											onCheckedChange={(checked) => handleSelectOne(qr, checked === true)}
											aria-label={`Select ${qr.qrCode}`}
										/>
									</TableCell>
								)}
								<TableCell>
									<div className="flex items-center gap-2">
										<QrCode className="h-4 w-4 text-muted-foreground" />
										<span className="font-mono text-sm">{qr.qrCode}</span>
									</div>
								</TableCell>
								<TableCell>{getStatusBadge(qr.status)}</TableCell>
								<TableCell className="text-sm">{getCompanyName(qr.companyId)}</TableCell>
								<TableCell className="text-sm">
									{(() => {
										const display = getAssetDisplay(qr);
										return display.isMuted ? (
											<span className="text-muted-foreground">{display.text}</span>
										) : (
											<span>{display.text}</span>
										);
									})()}
								</TableCell>
								<TableCell className="text-sm text-muted-foreground">
									{qr.createdAt ? format(new Date(qr.createdAt), "dd MMM yyyy, hh:mm a") : "—"}
								</TableCell>
								<TableCell>
									<DropdownMenu modal={false}>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" className="h-8 w-8">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												onClick={(e) => {
													e.stopPropagation();
													onView?.(qr);
												}}
											>
												<Eye className="h-4 w-4 mr-2" />
												View Details
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={(e) => {
													e.stopPropagation();
													onRetire?.(qr);
												}}
												disabled={qr.status === "retired"}
											>
												<Archive className="h-4 w-4 mr-2" />
												Retire QR Code
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={(e) => {
													e.stopPropagation();
													onDelete?.(qr);
												}}
												className="text-destructive"
											>
												<Trash2 className="h-4 w-4 mr-2" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			{pagination && pagination.totalPages > 1 && (
				<div className="flex items-center justify-between px-4 py-3 border-t">
					<div className="text-sm text-muted-foreground">
						Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
						{Math.min(pagination.page * pagination.limit, pagination.totalResults)} of {pagination.totalResults} results
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => onPageChange?.(pagination.page - 1)}
							disabled={pagination.page === 1}
						>
							Previous
						</Button>
						<span className="text-sm">
							Page {pagination.page} of {pagination.totalPages}
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => onPageChange?.(pagination.page + 1)}
							disabled={pagination.page === pagination.totalPages}
						>
							Next
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
