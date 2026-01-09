import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRightLeft, Loader2, Package, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import adminService from "@/api/services/adminService";
import assetService from "@/api/services/assetService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Textarea } from "@/ui/textarea";

interface SelectedAsset {
	_id: string;
	serialNumber: string;
}

export function AssetManagement() {
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState("");
	const [transferModal, setTransferModal] = useState<SelectedAsset | null>(null);
	const [retireModal, setRetireModal] = useState<SelectedAsset | null>(null);
	const [targetCompany, setTargetCompany] = useState("");
	const [retireReason, setRetireReason] = useState("");

	const { data: assetsData, isLoading } = useQuery({
		queryKey: ["assets"],
		queryFn: () => assetService.getAssets({ limit: 100 }),
	});

	const { data: companiesData } = useQuery({
		queryKey: ["admin", "companies"],
		queryFn: () => adminService.getCompanies({ limit: 100 }),
	});

	const transferMutation = useMutation({
		mutationFn: assetService.transferAsset,
		onSuccess: () => {
			toast.success("Asset transferred successfully");
			queryClient.invalidateQueries({ queryKey: ["assets"] });
			setTransferModal(null);
			setTargetCompany("");
		},
		onError: () => {
			toast.error("Failed to transfer asset");
		},
	});

	const retireMutation = useMutation({
		mutationFn: ({ assetId, reason }: { assetId: string; reason?: string }) =>
			assetService.retireAsset(assetId, reason),
		onSuccess: () => {
			toast.success("Asset retired successfully");
			queryClient.invalidateQueries({ queryKey: ["assets"] });
			setRetireModal(null);
			setRetireReason("");
		},
		onError: () => {
			toast.error("Failed to retire asset");
		},
	});

	const assets = assetsData?.results || [];
	const companies = companiesData?.results || [];

	const filteredAssets = assets.filter((asset: { serialNumber: string; make: string; model: string }) => {
		if (!searchQuery) return true;
		return (
			asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
			asset.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
			asset.model.toLowerCase().includes(searchQuery.toLowerCase())
		);
	});

	const handleTransfer = () => {
		if (!transferModal || !targetCompany) return;
		transferMutation.mutate({
			assetId: transferModal._id,
			toCompanyId: targetCompany,
		});
	};

	const handleRetire = () => {
		if (!retireModal) return;
		retireMutation.mutate({
			assetId: retireModal._id,
			reason: retireReason || undefined,
		});
	};

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Package className="h-5 w-5" />
						Asset Management
					</CardTitle>
					<CardDescription>Transfer assets between companies or retire them</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Search */}
					<Input
						placeholder="Search assets by serial number, make, or model..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>

					{/* Assets Table */}
					<div className="rounded-md border max-h-[400px] overflow-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Serial Number</TableHead>
									<TableHead>Make / Model</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="w-[150px]">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
											Loading assets...
										</TableCell>
									</TableRow>
								) : filteredAssets.length === 0 ? (
									<TableRow>
										<TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
											No assets found
										</TableCell>
									</TableRow>
								) : (
									filteredAssets.slice(0, 20).map((asset) => (
										<TableRow key={asset._id || asset.id}>
											<TableCell className="font-mono text-sm">{asset.serialNumber}</TableCell>
											<TableCell>
												{asset.make} {asset.model}
											</TableCell>
											<TableCell>
												<Badge variant={asset.status === "active" ? "default" : "secondary"}>{asset.status}</Badge>
											</TableCell>
											<TableCell>
												<div className="flex gap-1">
													<Button
														variant="ghost"
														size="icon"
														onClick={() =>
															setTransferModal({ _id: asset._id || asset.id || "", serialNumber: asset.serialNumber })
														}
														title="Transfer"
													>
														<ArrowRightLeft className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() =>
															setRetireModal({ _id: asset._id || asset.id || "", serialNumber: asset.serialNumber })
														}
														title="Retire"
													>
														<Trash2 className="h-4 w-4 text-destructive" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
					{filteredAssets.length > 20 && (
						<p className="text-xs text-muted-foreground text-center">Showing 20 of {filteredAssets.length} assets</p>
					)}
				</CardContent>
			</Card>

			{/* Transfer Modal */}
			<Dialog open={!!transferModal} onOpenChange={() => setTransferModal(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Transfer Asset</DialogTitle>
						<DialogDescription>
							Transfer asset <strong>{transferModal?.serialNumber}</strong> to another company
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Target Company</Label>
							<Select value={targetCompany} onValueChange={setTargetCompany}>
								<SelectTrigger>
									<SelectValue placeholder="Select company" />
								</SelectTrigger>
								<SelectContent>
									{companies.map((company: { _id: string; companyName: string }) => (
										<SelectItem key={company._id} value={company._id}>
											{company.companyName}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setTransferModal(null)}>
							Cancel
						</Button>
						<Button onClick={handleTransfer} disabled={!targetCompany || transferMutation.isPending}>
							{transferMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Transfer Asset
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Retire Modal */}
			<Dialog open={!!retireModal} onOpenChange={() => setRetireModal(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Retire Asset</DialogTitle>
						<DialogDescription>
							Mark asset <strong>{retireModal?.serialNumber}</strong> as retired. This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Reason (optional)</Label>
							<Textarea
								placeholder="Enter reason for retirement..."
								value={retireReason}
								onChange={(e) => setRetireReason(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setRetireModal(null)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleRetire} disabled={retireMutation.isPending}>
							{retireMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Retire Asset
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
