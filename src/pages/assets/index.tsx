import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, FileSpreadsheet, Plus, Search } from "lucide-react";
import { useState } from "react";
import assetService from "@/api/services/assetService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { AssetImport } from "../settings/components/AssetImport";
import { AssetTemplates } from "../settings/components/AssetTemplates";

export default function AssetsPage() {
	const [page, setPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [importModalOpen, setImportModalOpen] = useState(false);
	const [templateModalOpen, setTemplateModalOpen] = useState(false);
	const limit = 20;

	const { data, isLoading } = useQuery({
		queryKey: ["assets", page, limit],
		queryFn: () => assetService.getAssets({ page, limit }),
	});

	const assets = data?.results || [];
	const totalPages = data?.totalPages || 1;
	const totalResults = data?.totalResults || 0;

	// Client-side search filter
	const filteredAssets = searchQuery
		? assets.filter(
				(asset) =>
					asset.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					asset.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					asset.model?.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		: assets;

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

	const getVerificationBadge = (status: string) => {
		switch (status) {
			case "verified":
				return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Verified</Badge>;
			case "due_soon":
				return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Due Soon</Badge>;
			case "overdue":
				return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Overdue</Badge>;
			case "never_verified":
				return <Badge variant="outline">Never Verified</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="text-xl font-semibold">Assets</h1>
						<p className="text-sm text-muted-foreground">View and manage your company assets</p>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" onClick={() => setImportModalOpen(true)}>
							<FileSpreadsheet className="h-4 w-4 mr-2" />
							Import
						</Button>
						<Button variant="outline" onClick={() => setTemplateModalOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Template
						</Button>
					</div>
				</div>
			</div>

			{/* Search */}
			<div className="flex-shrink-0 px-6 py-4 border-b">
				<div className="relative max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search by serial number, make, or model..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>

			{/* Results count & Pagination */}
			<div className="flex-shrink-0 flex items-center justify-between px-6 py-2 bg-muted/30">
				<p className="text-sm text-muted-foreground">
					{isLoading ? "Loading..." : `Showing ${filteredAssets.length} of ${totalResults} assets`}
				</p>
				{totalPages > 1 && (
					<div className="flex items-center gap-2">
						<Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<span className="text-sm text-muted-foreground">
							{page} / {totalPages}
						</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							disabled={page === totalPages}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				)}
			</div>

			{/* Table */}
			<div className="flex-1 overflow-auto px-6 py-4">
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Serial Number</TableHead>
								<TableHead>Make / Model</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Verification</TableHead>
								<TableHead>Frequency</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								Array.from({ length: 10 }).map((_, i) => (
									<TableRow key={i}>
										<TableCell>
											<Skeleton className="h-4 w-24" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-32" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-5 w-16" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-5 w-20" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-16" />
										</TableCell>
									</TableRow>
								))
							) : filteredAssets.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
										No assets found
									</TableCell>
								</TableRow>
							) : (
								filteredAssets.map((asset) => (
									<TableRow key={asset._id}>
										<TableCell className="font-mono text-sm">{asset.serialNumber}</TableCell>
										<TableCell>
											{asset.make} {asset.model}
										</TableCell>
										<TableCell>{getStatusBadge(asset.status)}</TableCell>
										<TableCell>{getVerificationBadge(asset.verificationStatus || "unknown")}</TableCell>
										<TableCell className="text-muted-foreground">{asset.verificationFrequency} days</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Import Modal */}
			<Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
				<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Bulk Asset Import</DialogTitle>
					</DialogHeader>
					<AssetImport />
				</DialogContent>
			</Dialog>

			{/* Template Modal */}
			<Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
				<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Asset Templates</DialogTitle>
					</DialogHeader>
					<AssetTemplates />
				</DialogContent>
			</Dialog>
		</div>
	);
}
