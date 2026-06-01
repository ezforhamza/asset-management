import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Package, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Asset } from "#/entity";
import assetService from "@/api/services/assetService";
import repairRequestService from "@/api/services/repairRequestService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";

interface LogRepairRequestModalProps {
	open: boolean;
	onClose: () => void;
}

export function LogRepairRequestModal({ open, onClose }: LogRepairRequestModalProps) {
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [notes, setNotes] = useState("");
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const t = setTimeout(() => setDebouncedSearch(search), 300);
		return () => clearTimeout(t);
	}, [search]);

	useEffect(() => {
		setDropdownOpen(debouncedSearch.length >= 2 && !selectedAsset);
	}, [debouncedSearch, selectedAsset]);

	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (!containerRef.current?.contains(e.target as Node)) setDropdownOpen(false);
		};
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	const { data: searchData, isFetching } = useQuery({
		queryKey: ["repair-log-search", debouncedSearch],
		queryFn: () => assetService.getAssets({ search: debouncedSearch, limit: 8 }),
		enabled: debouncedSearch.length >= 2 && !selectedAsset,
	});

	const mutation = useMutation({
		mutationFn: () => {
			if (!selectedAsset) throw new Error("No asset selected");
			const assetId =
				(selectedAsset as Asset & { _id?: string }).id || (selectedAsset as Asset & { _id?: string })._id || "";
			return repairRequestService.createRepairRequest(assetId, { notes: notes.trim() || undefined });
		},
		onSuccess: () => {
			toast.success("Repair request logged successfully");
			queryClient.invalidateQueries({ queryKey: ["repair-requests"] });
			handleClose();
		},
		onError: () => {
			toast.error("Failed to log repair request");
		},
	});

	const handleClose = () => {
		setSearch("");
		setDebouncedSearch("");
		setSelectedAsset(null);
		setDropdownOpen(false);
		setNotes("");
		onClose();
	};

	const results = (searchData?.results || []) as Array<Asset & { _id?: string }>;

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>Log Repair Request</DialogTitle>
					<DialogDescription>Search for an asset and describe the issue.</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-1">
					{/* Asset Search */}
					<div className="space-y-1.5">
						<Label>Asset *</Label>
						{selectedAsset ? (
							<div className="flex items-center justify-between p-3 bg-muted rounded-md border">
								<div className="flex items-center gap-2">
									<Package className="h-4 w-4 text-muted-foreground shrink-0" />
									<div>
										<p className="font-mono text-sm font-medium">
											{(selectedAsset as Asset & { serialNumber?: string }).serialNumber}
										</p>
										<p className="text-xs text-muted-foreground">
											{(selectedAsset as Asset & { make?: string; model?: string }).make}{" "}
											{(selectedAsset as Asset & { make?: string; model?: string }).model}
										</p>
									</div>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => {
										setSelectedAsset(null);
										setSearch("");
									}}
								>
									Change
								</Button>
							</div>
						) : (
							<div ref={containerRef} className="relative">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search serial number, make, model..."
										value={search}
										onChange={(e) => setSearch(e.target.value)}
										className="pl-9"
										onFocus={() => debouncedSearch.length >= 2 && setDropdownOpen(true)}
									/>
								</div>
								{dropdownOpen && (
									<div className="absolute top-full mt-1 left-0 right-0 bg-popover border rounded-md shadow-lg z-50 overflow-hidden">
										{isFetching ? (
											<div className="flex justify-center p-4">
												<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
											</div>
										) : results.length === 0 ? (
											<p className="text-sm text-muted-foreground text-center py-4">No assets found</p>
										) : (
											<ul>
												{results.map((asset) => (
													<li key={asset.id || asset._id}>
														<button
															type="button"
															className="w-full text-left px-3 py-2.5 hover:bg-muted/60 transition-colors flex items-center gap-3"
															onClick={() => {
																setSelectedAsset(asset);
																setDropdownOpen(false);
															}}
														>
															<Package className="h-4 w-4 text-muted-foreground shrink-0" />
															<div>
																<p className="font-mono text-sm font-medium">{asset.serialNumber}</p>
																<p className="text-xs text-muted-foreground">
																	{asset.make} {asset.model}
																	{asset.siteName ? ` · ${asset.siteName}` : ""}
																</p>
															</div>
														</button>
													</li>
												))}
											</ul>
										)}
									</div>
								)}
							</div>
						)}
					</div>

					{/* Notes */}
					<div className="space-y-1.5">
						<Label htmlFor="repair-notes">Notes (optional)</Label>
						<Textarea
							id="repair-notes"
							placeholder="Describe the issue or reason for the repair request..."
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							maxLength={1000}
							rows={3}
						/>
						<p className="text-xs text-muted-foreground text-right">{notes.length}/1000</p>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={() => mutation.mutate()} disabled={!selectedAsset || mutation.isPending}>
						{mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						Submit Repair Request
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
