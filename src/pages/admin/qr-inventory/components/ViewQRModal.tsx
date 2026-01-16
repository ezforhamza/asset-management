import { format } from "date-fns";
import { Building2, Calendar, Link2, QrCode, Tag } from "lucide-react";
import type { Company, QRCode as QRCodeType } from "#/entity";
import { Badge } from "@/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Separator } from "@/ui/separator";

interface ViewQRModalProps {
	open: boolean;
	onClose: () => void;
	qrCode: QRCodeType | null;
	companies: Company[];
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

export function ViewQRModal({ open, onClose, qrCode, companies }: ViewQRModalProps) {
	if (!qrCode) return null;

	const getCompanyName = (companyId: string | { id: string; companyName: string } | null) => {
		if (!companyId) return "Not allocated";
		if (typeof companyId === "object") return companyId.companyName;
		const company = companies.find((c) => c._id === companyId);
		return company?.companyName || "Unknown";
	};

	const getAssetInfo = () => {
		if (!qrCode.assetId) return "Not linked";
		if (typeof qrCode.assetId === "object") {
			const asset = qrCode.assetId;
			const serialNumber = asset.serialNumber || "S.No not added";
			const make = asset.make || null;
			const model = asset.model || null;
			
			// Build make/model part only if at least one exists
			if (make && model) {
				return `${serialNumber} (${make} ${model})`;
			}
			if (make) {
				return `${serialNumber} (${make})`;
			}
			if (model) {
				return `${serialNumber} (${model})`;
			}
			// Neither make nor model available
			return serialNumber;
		}
		return qrCode.assetSerialNumber || qrCode.assetId;
	};

	const formatDate = (dateStr: string | null | undefined) => {
		if (!dateStr) return "—";
		try {
			return format(new Date(dateStr), "dd MMM yyyy, hh:mm a");
		} catch {
			return "—";
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<QrCode className="h-5 w-5" />
						QR Code Details
					</DialogTitle>
					<DialogDescription>View detailed information about this QR code.</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* QR Code & Status */}
					<div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
						<div>
							<p className="text-xs text-muted-foreground">QR Code</p>
							<p className="font-mono text-lg font-medium">{qrCode.qrCode}</p>
						</div>
						<div className="text-right">
							<p className="text-xs text-muted-foreground mb-1">Status</p>
							{getStatusBadge(qrCode.status)}
						</div>
					</div>

					<Separator />

					{/* Details Grid */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1">
							<div className="flex items-center gap-2 text-muted-foreground">
								<Building2 className="h-4 w-4" />
								<span className="text-xs">Company</span>
							</div>
							<p className="text-sm font-medium">{getCompanyName(qrCode.companyId)}</p>
						</div>

						<div className="space-y-1">
							<div className="flex items-center gap-2 text-muted-foreground">
								<Link2 className="h-4 w-4" />
								<span className="text-xs">Asset</span>
							</div>
							<p className="text-sm font-medium">{getAssetInfo()}</p>
						</div>
					</div>

					<Separator />

					{/* Timestamps */}
					<div className="space-y-3">
						<div className="flex items-center gap-2 text-muted-foreground mb-2">
							<Calendar className="h-4 w-4" />
							<span className="text-xs font-medium">Timeline</span>
						</div>

						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-muted-foreground text-xs">Created At</p>
								<p className="font-medium">{formatDate(qrCode.createdAt)}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">Allocated At</p>
								<p className="font-medium">{formatDate(qrCode.allocatedAt)}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">Linked At</p>
								<p className="font-medium">{formatDate(qrCode.linkedAt)}</p>
							</div>
							{(qrCode as any).unlinkedAt && (
								<div>
									<p className="text-muted-foreground text-xs">Unlinked At</p>
									<p className="font-medium">{formatDate((qrCode as any).unlinkedAt)}</p>
								</div>
							)}
						</div>
					</div>

					<Separator />

					{/* ID */}
					<div className="flex items-center gap-2">
						<Tag className="h-4 w-4 text-muted-foreground" />
						<span className="text-xs text-muted-foreground">ID:</span>
						<code className="text-xs bg-muted px-2 py-0.5 rounded">{qrCode.id || qrCode._id}</code>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
