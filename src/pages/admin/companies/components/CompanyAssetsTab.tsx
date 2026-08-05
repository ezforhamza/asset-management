import { useQuery } from "@tanstack/react-query";
import { Download, FileSpreadsheet, FileText, Loader2, MapPin, Package, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import assetCategoryService from "@/api/services/assetCategoryService";
import assetService from "@/api/services/assetService";
import siteNameService from "@/api/services/siteNameService";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { StyledBadge } from "@/utils/badge-styles";
import { formatLabel } from "@/utils/formatLabel";

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
			return <StyledBadge color="gray">{formatLabel(status)}</StyledBadge>;
	}
};

const getVerificationBadge = (status: string) => {
	switch (status) {
		case "verified":
			return <StyledBadge color="emerald">Verified</StyledBadge>;
		case "failed":
			return <StyledBadge color="red">Failed</StyledBadge>;
		case "pending":
			return <StyledBadge color="yellow">Pending</StyledBadge>;
		case "never_verified":
			return <StyledBadge color="gray">Never Verified</StyledBadge>;
		default:
			return <StyledBadge color="gray">{formatLabel(status)}</StyledBadge>;
	}
};

const ROWS_PER_PAGE = 10;

export function CompanyAssetsTab({ companyId }: CompanyAssetsTabProps) {
	const [page, setPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("");
	const [clientFilter, setClientFilter] = useState("");
	const [siteNameFilter, setSiteNameFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [channelFilter, setChannelFilter] = useState("");
	const [regionFilter, setRegionFilter] = useState("");
	const [exporting, setExporting] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchQuery);
			setPage(1);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	const queryParams = useMemo(() => {
		const params: Record<string, string | number> = { companyId, page, limit: ROWS_PER_PAGE };
		if (debouncedSearch) params.search = debouncedSearch;
		if (categoryFilter) params.categoryId = categoryFilter;
		if (clientFilter) params.client = clientFilter;
		if (siteNameFilter) params.siteName = siteNameFilter;
		if (statusFilter) params.status = statusFilter;
		if (channelFilter) params.channel = channelFilter;
		if (regionFilter) params.region = regionFilter;
		return params;
	}, [
		companyId,
		page,
		debouncedSearch,
		categoryFilter,
		clientFilter,
		siteNameFilter,
		statusFilter,
		channelFilter,
		regionFilter,
	]);

	const { data, isLoading } = useQuery({
		queryKey: ["assets", "company", companyId, queryParams],
		queryFn: () => assetService.getAssets(queryParams),
	});

	const { data: categoriesData } = useQuery({
		queryKey: ["asset-categories", "company", companyId],
		queryFn: () => assetCategoryService.getCategories({ page: 1, limit: 100, companyId }),
	});

	const { data: siteNamesData } = useQuery({
		queryKey: ["site-names", "company", companyId],
		queryFn: () => siteNameService.getSiteNames({ page: 1, limit: 100, sortBy: "name:asc", companyId }),
	});

	// Fetch a broader batch purely to derive distinct filter values (client, channel, region)
	const { data: allAssetsData } = useQuery({
		queryKey: ["assets", "company", companyId, "all-for-filters"],
		queryFn: () => assetService.getAssets({ companyId, page: 1, limit: 1000 }),
	});

	const filterOptions = useMemo(() => {
		const allAssets = allAssetsData?.results || [];
		const clients = [...new Set(allAssets.map((a) => a.client).filter(Boolean))] as string[];
		const channels = [...new Set(allAssets.map((a) => a.channel).filter(Boolean))] as string[];
		const regions = [...new Set(allAssets.map((a) => a.region).filter(Boolean))] as string[];
		return { clients, channels, regions };
	}, [allAssetsData]);

	const assets = data?.results || [];
	const totalResults = data?.totalResults || 0;
	const totalPages = data?.totalPages || 1;
	const hasFilters = !!(
		categoryFilter ||
		clientFilter ||
		siteNameFilter ||
		statusFilter ||
		channelFilter ||
		regionFilter
	);

	const handleClearFilters = () => {
		setCategoryFilter("");
		setClientFilter("");
		setSiteNameFilter("");
		setStatusFilter("");
		setChannelFilter("");
		setRegionFilter("");
		setPage(1);
	};

	const handleExport = async (format: "xlsx" | "pdf") => {
		setExporting(true);
		try {
			const params: { format: "xlsx" | "pdf"; categoryId?: string; region?: string; companyId: string } = {
				format,
				companyId,
			};
			if (categoryFilter) params.categoryId = categoryFilter;
			if (regionFilter) params.region = regionFilter;

			await assetService.exportAssets(params);
			toast.success(`Assets exported as ${format.toUpperCase()}`);
		} catch (error) {
			console.error("Export error:", error);
			toast.error("Failed to export assets");
		} finally {
			setTimeout(() => setExporting(false), 1000);
		}
	};

	return (
		<div className="space-y-3">
			{/* Filters */}
			<div className="flex items-center gap-3 flex-wrap">
				<div className="relative flex-1 min-w-[180px] max-w-xs">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search serial, make, model, site, channel, client..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>

				<Select
					value={categoryFilter}
					onValueChange={(val) => {
						setCategoryFilter(val);
						setPage(1);
					}}
				>
					<SelectTrigger className="w-[150px]">
						<SelectValue placeholder="Category" />
					</SelectTrigger>
					<SelectContent>
						{categoriesData?.results
							?.filter((c) => c.status === "active")
							.map((category) => (
								<SelectItem key={category.id} value={category.id}>
									{category.name}
								</SelectItem>
							))}
						{(!categoriesData?.results || categoriesData.results.filter((c) => c.status === "active").length === 0) && (
							<div className="px-2 py-1.5 text-sm text-muted-foreground">No categories</div>
						)}
					</SelectContent>
				</Select>

				<Select
					value={clientFilter}
					onValueChange={(val) => {
						setClientFilter(val);
						setPage(1);
					}}
				>
					<SelectTrigger className="w-[130px]">
						<SelectValue placeholder="Client" />
					</SelectTrigger>
					<SelectContent>
						{filterOptions.clients.map((client) => (
							<SelectItem key={client} value={client}>
								{client}
							</SelectItem>
						))}
						{filterOptions.clients.length === 0 && (
							<div className="px-2 py-1.5 text-sm text-muted-foreground">No clients</div>
						)}
					</SelectContent>
				</Select>

				<Select
					value={siteNameFilter}
					onValueChange={(val) => {
						setSiteNameFilter(val);
						setPage(1);
					}}
				>
					<SelectTrigger className="w-[130px]">
						<SelectValue placeholder="Site Name" />
					</SelectTrigger>
					<SelectContent>
						{siteNamesData?.results?.map((sn) => (
							<SelectItem key={sn.id} value={sn.name}>
								{sn.name}
							</SelectItem>
						))}
						{(!siteNamesData?.results || siteNamesData.results.length === 0) && (
							<div className="px-2 py-1.5 text-sm text-muted-foreground">No sites</div>
						)}
					</SelectContent>
				</Select>

				<Select
					value={statusFilter}
					onValueChange={(val) => {
						setStatusFilter(val);
						setPage(1);
					}}
				>
					<SelectTrigger className="w-[120px]">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="active">Active</SelectItem>
						<SelectItem value="inactive">Inactive</SelectItem>
						<SelectItem value="retired">Retired</SelectItem>
					</SelectContent>
				</Select>

				<Select
					value={channelFilter}
					onValueChange={(val) => {
						setChannelFilter(val);
						setPage(1);
					}}
				>
					<SelectTrigger className="w-[130px]">
						<SelectValue placeholder="Channel" />
					</SelectTrigger>
					<SelectContent>
						{filterOptions.channels.map((channel) => (
							<SelectItem key={channel} value={channel}>
								{channel}
							</SelectItem>
						))}
						{filterOptions.channels.length === 0 && (
							<div className="px-2 py-1.5 text-sm text-muted-foreground">No channels</div>
						)}
					</SelectContent>
				</Select>

				<Select
					value={regionFilter}
					onValueChange={(val) => {
						setRegionFilter(val);
						setPage(1);
					}}
				>
					<SelectTrigger className="w-[130px]">
						<SelectValue placeholder="Region" />
					</SelectTrigger>
					<SelectContent>
						{filterOptions.regions.map((region) => (
							<SelectItem key={region} value={region}>
								{region}
							</SelectItem>
						))}
						{filterOptions.regions.length === 0 && (
							<div className="px-2 py-1.5 text-sm text-muted-foreground">No regions</div>
						)}
					</SelectContent>
				</Select>

				{hasFilters && (
					<Button variant="ghost" size="sm" onClick={handleClearFilters}>
						<X className="h-4 w-4 mr-1" />
						Clear Filters
					</Button>
				)}

				<div className="ml-auto">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm" disabled={exporting}>
								{exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
								Export
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => handleExport("xlsx")}>
								<FileSpreadsheet className="h-4 w-4 mr-2" />
								Export as Excel
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => handleExport("pdf")}>
								<FileText className="h-4 w-4 mr-2" />
								Export as PDF
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Table */}
			<div className="rounded-md border flex flex-col">
				<div className="overflow-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Serial Number</TableHead>
								<TableHead>Make / Model</TableHead>
								<TableHead>Category</TableHead>
								<TableHead>QR Code</TableHead>
								<TableHead>Registered GPS</TableHead>
								<TableHead>Site Name</TableHead>
								<TableHead>Location</TableHead>
								<TableHead>Channel</TableHead>
								<TableHead>Client</TableHead>
								<TableHead>Region</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Verification</TableHead>
								<TableHead>Registration</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								Array.from({ length: 5 }).map((_, i) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows have no stable id
									<TableRow key={`skeleton-${i}`}>
										{Array.from({ length: 13 }).map((_, j) => (
											// biome-ignore lint/suspicious/noArrayIndexKey: skeleton cells have no stable id
											<TableCell key={j}>
												<Skeleton className="h-4 w-20" />
											</TableCell>
										))}
									</TableRow>
								))
							) : assets.length === 0 ? (
								<TableRow>
									<TableCell colSpan={13} className="text-center py-12 text-muted-foreground">
										<div className="flex flex-col items-center">
											<Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
											<h3 className="text-lg font-medium">No assets found</h3>
											<p className="text-sm text-muted-foreground">
												{hasFilters || debouncedSearch
													? "Try adjusting your filters."
													: "This company has no registered assets yet."}
											</p>
										</div>
									</TableCell>
								</TableRow>
							) : (
								assets.map((asset) => (
									<TableRow key={asset.id}>
										<TableCell className="font-mono text-sm">
											{asset.serialNumber || (
												<span className="text-muted-foreground italic text-xs">Not added yet</span>
											)}
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
										<TableCell className="text-muted-foreground">{asset.category?.name || "Not assigned"}</TableCell>
										<TableCell className="font-mono text-xs">{asset.qrCode?.code || "Not linked"}</TableCell>
										<TableCell>
											{asset.location?.mapLink ? (
												<a
													href={asset.location.mapLink}
													target="_blank"
													rel="noreferrer"
													className="inline-flex items-center text-xs text-primary hover:underline"
												>
													<MapPin className="h-3 w-3 mr-1" />
													View on Map
												</a>
											) : (
												<span className="text-muted-foreground text-sm">No GPS</span>
											)}
										</TableCell>
										<TableCell className="text-muted-foreground">{asset.siteName || "—"}</TableCell>
										<TableCell className="text-muted-foreground">{asset.locationDescription || "—"}</TableCell>
										<TableCell className="text-muted-foreground">{asset.channel || "—"}</TableCell>
										<TableCell className="text-muted-foreground">{asset.client || "—"}</TableCell>
										<TableCell className="text-muted-foreground">{asset.region || "—"}</TableCell>
										<TableCell>{getStatusBadge(asset.status)}</TableCell>
										<TableCell>{getVerificationBadge(asset.verificationStatus || "never_verified")}</TableCell>
										<TableCell>
											{asset.registrationState === "unregistered" || !asset.registrationState ? (
												<StyledBadge color="orange">Pending</StyledBadge>
											) : (
												<StyledBadge color="emerald">Completed</StyledBadge>
											)}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
				{totalPages > 1 && (
					<div className="flex items-center justify-between px-4 py-3 border-t">
						<div className="text-sm text-muted-foreground">
							Showing {(page - 1) * ROWS_PER_PAGE + 1} to {Math.min(page * ROWS_PER_PAGE, totalResults)} of{" "}
							{totalResults} results
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm" onClick={() => setPage((prev) => prev - 1)} disabled={page === 1}>
								Previous
							</Button>
							<span className="text-sm">
								Page {page} of {totalPages}
							</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage((prev) => prev + 1)}
								disabled={page === totalPages}
							>
								Next
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
