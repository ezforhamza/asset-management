import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ChevronLeft, ChevronRight, MapPin, MoreHorizontal, Pencil, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { Asset } from "#/entity";
import adminService from "@/api/services/adminService";
import assetCategoryService from "@/api/services/assetCategoryService";
import assetService, { type AssetsListParams } from "@/api/services/assetService";
import { CorrectGpsModal } from "@/components/correct-gps-modal";
import { EditAssetModal } from "@/components/edit-asset-modal";
import { useUserInfo } from "@/store/userStore";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { getAssetStatusBadge, getVerificationStatusBadge, StyledBadge } from "@/utils/badge-styles";
import { format } from "date-fns";

export default function SuperUserAssetsPage() {
	const { companyId } = useParams<{ companyId: string }>();
	const navigate = useNavigate();

	const [page, setPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [verificationFilter, setVerificationFilter] = useState("");
	const [registrationFilter, setRegistrationFilter] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("");
	const [gpsModalAsset, setGpsModalAsset] = useState<Asset | null>(null);
	const [editModalAsset, setEditModalAsset] = useState<Asset | null>(null);
	const limit = 20;

	const userInfo = useUserInfo();
	const isReadWrite = userInfo.superUserType === "read_write";

	useEffect(() => {
		const t = setTimeout(() => {
			setDebouncedSearch(searchQuery);
			setPage(1);
		}, 300);
		return () => clearTimeout(t);
	}, [searchQuery]);

	const { data: companyData } = useQuery({
		queryKey: ["super-user", "company", companyId],
		queryFn: () => adminService.getCompany(companyId ?? ""),
		enabled: !!companyId,
	});

	const { data: categoriesData } = useQuery({
		queryKey: ["super-user", "categories", companyId],
		queryFn: () => assetCategoryService.getCategories({ page: 1, limit: 100 }),
		enabled: !!companyId,
	});

	const queryParams: AssetsListParams = useMemo(() => {
		const params: AssetsListParams = { page, limit, companyId };
		if (debouncedSearch) params.search = debouncedSearch;
		if (statusFilter) params.status = statusFilter;
		if (verificationFilter) params.verificationStatus = verificationFilter;
		if (registrationFilter) params.registrationState = registrationFilter;
		if (categoryFilter) params.categoryId = categoryFilter;
		return params;
	}, [page, debouncedSearch, statusFilter, verificationFilter, registrationFilter, categoryFilter, companyId]);

	const { data, isLoading } = useQuery({
		queryKey: ["super-user", "assets", companyId, queryParams],
		queryFn: () => assetService.getAssets(queryParams),
		enabled: !!companyId,
	});

	const assets = data?.results || [];
	const totalPages = data?.totalPages || 1;
	const totalResults = data?.totalResults || 0;
	const companyName = companyData?.companyName || "Company";
	const hasFilters = !!(statusFilter || verificationFilter || registrationFilter || categoryFilter);

	const getAssetId = (asset: Asset) => asset.id || asset._id || "";

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header / Breadcrumb */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
				<nav className="text-sm text-muted-foreground mb-1">
					<button
						type="button"
						onClick={() => navigate("/super-user/dashboard")}
						className="hover:text-foreground transition-colors"
					>
						Support Portal
					</button>
					{" > "}
					<span className="text-foreground">{companyName}</span>
					{" > "}
					<span className="text-foreground">Assets</span>
				</nav>
				<h1 className="text-xl font-semibold">{companyName} — Assets</h1>
			</div>

			{/* Filters */}
			<div className="flex-shrink-0 px-6 py-4 border-b space-y-3">
				<div className="flex flex-wrap items-center gap-3">
					<div className="relative flex-1 min-w-[200px] max-w-xs">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search serial, make, model..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>

					<Select
						value={registrationFilter}
						onValueChange={(v) => {
							setRegistrationFilter(v);
							setPage(1);
						}}
					>
						<SelectTrigger className="w-[160px]">
							<SelectValue placeholder="Registration" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="unregistered">Unregistered</SelectItem>
							<SelectItem value="partially_registered">Partial</SelectItem>
							<SelectItem value="fully_registered">Registered</SelectItem>
						</SelectContent>
					</Select>

					<Select
						value={verificationFilter}
						onValueChange={(v) => {
							setVerificationFilter(v);
							setPage(1);
						}}
					>
						<SelectTrigger className="w-[160px]">
							<SelectValue placeholder="Verification" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="on_time">On Time</SelectItem>
							<SelectItem value="overdue">Overdue</SelectItem>
							<SelectItem value="due_soon">Due Soon</SelectItem>
							<SelectItem value="never_verified">Never Verified</SelectItem>
						</SelectContent>
					</Select>

					<Select
						value={statusFilter}
						onValueChange={(v) => {
							setStatusFilter(v);
							setPage(1);
						}}
					>
						<SelectTrigger className="w-[130px]">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="active">Active</SelectItem>
							<SelectItem value="inactive">Inactive</SelectItem>
							<SelectItem value="retired">Retired</SelectItem>
						</SelectContent>
					</Select>

					<Select
						value={categoryFilter}
						onValueChange={(v) => {
							setCategoryFilter(v);
							setPage(1);
						}}
					>
						<SelectTrigger className="w-[150px]">
							<SelectValue placeholder="Category" />
						</SelectTrigger>
						<SelectContent>
							{categoriesData?.results
								?.filter((c) => c.status === "active")
								.map((c) => (
									<SelectItem key={c.id} value={c.id}>
										{c.name}
									</SelectItem>
								))}
						</SelectContent>
					</Select>

					{hasFilters && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setStatusFilter("");
								setVerificationFilter("");
								setRegistrationFilter("");
								setCategoryFilter("");
								setPage(1);
							}}
						>
							<X className="h-4 w-4 mr-1" />
							Clear
						</Button>
					)}
				</div>
			</div>

			{/* Results count */}
			<div className="flex-shrink-0 px-6 py-2 bg-muted/30">
				<p className="text-sm text-muted-foreground">{isLoading ? "Loading..." : `${totalResults} assets`}</p>
			</div>

			{/* Table */}
			<div className="flex-1 min-h-0 overflow-hidden px-6 py-4">
				<div className="rounded-md border flex flex-col h-full overflow-hidden">
					<div className="flex-1 min-h-0 overflow-auto">
						<Table>
							<TableHeader className="sticky top-0 bg-background z-10">
								<TableRow>
									<TableHead>Serial Number</TableHead>
									<TableHead>Make / Model</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Site Name</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Registration</TableHead>
									<TableHead>Verification</TableHead>
									<TableHead>Last Verified</TableHead>
									<TableHead>GPS</TableHead>
									{isReadWrite && <TableHead className="w-[50px]" />}
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									Array.from({ length: 10 }).map((_, i) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
										<TableRow key={i}>
											{Array.from({ length: isReadWrite ? 10 : 9 }).map((_, j) => (
												// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
												<TableCell key={j}>
													<Skeleton className="h-4 w-20" />
												</TableCell>
											))}
										</TableRow>
									))
								) : assets.length === 0 ? (
									<TableRow>
										<TableCell colSpan={isReadWrite ? 10 : 9} className="text-center py-12 text-muted-foreground">
											No assets found
										</TableCell>
									</TableRow>
								) : (
									assets.map((asset) => (
										<TableRow
											key={getAssetId(asset)}
											className="cursor-pointer hover:bg-muted/50"
											onClick={(e) => {
												if ((e.target as HTMLElement).closest("button")) return;
												navigate(`/super-user/companies/${companyId}/assets/${getAssetId(asset)}`);
											}}
										>
											<TableCell className="font-mono text-sm">{asset.serialNumber}</TableCell>
											<TableCell>
												{asset.make} {asset.model}
											</TableCell>
											<TableCell className="text-muted-foreground">{asset.category?.name || "—"}</TableCell>
											<TableCell className="text-muted-foreground">{asset.siteName || "—"}</TableCell>
											<TableCell>{getAssetStatusBadge(asset.status)}</TableCell>
											<TableCell>
												{asset.registrationState === "unregistered" || !asset.registrationState ? (
													<StyledBadge color="orange">
														<AlertTriangle className="h-3 w-3 mr-1" />
														Pending
													</StyledBadge>
												) : (
													<StyledBadge color="emerald">Registered</StyledBadge>
												)}
											</TableCell>
											<TableCell>{getVerificationStatusBadge(asset.verificationStatus || "never_verified")}</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{asset.lastVerifiedAt
													? format(new Date(asset.lastVerifiedAt as string), "MMM d, yyyy")
													: "Never"}
											</TableCell>
											<TableCell>
												{asset.location?.latitude != null ? (
													<span className="text-xs font-mono text-muted-foreground">
														{asset.location.latitude.toFixed(4)}, {asset.location.longitude?.toFixed(4)}
													</span>
												) : (
													<span className="text-muted-foreground text-sm">No GPS</span>
												)}
											</TableCell>
											{isReadWrite && (
												<TableCell onClick={(e) => e.stopPropagation()}>
													<DropdownMenu modal={false}>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="icon" className="h-8 w-8">
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem onClick={() => setEditModalAsset(asset)}>
																<Pencil className="h-4 w-4 mr-2" />
																Edit Asset
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() => setGpsModalAsset(asset)}
																disabled={asset.location?.latitude == null}
															>
																<MapPin className="h-4 w-4 mr-2" />
																GPS Correction
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											)}
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					<div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-t bg-muted/30">
						<p className="text-sm text-muted-foreground">
							Page {page} of {totalPages || 1}
						</p>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page === 1}
							>
								<ChevronLeft className="h-4 w-4 mr-1" />
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								disabled={page >= totalPages}
							>
								Next
								<ChevronRight className="h-4 w-4 ml-1" />
							</Button>
						</div>
					</div>
				</div>
			</div>

			<CorrectGpsModal
				asset={gpsModalAsset}
				open={!!gpsModalAsset}
				onClose={() => setGpsModalAsset(null)}
				queryKeysToInvalidate={[["super-user", "assets"]]}
			/>

			<EditAssetModal
				asset={editModalAsset}
				open={!!editModalAsset}
				onClose={() => setEditModalAsset(null)}
				queryKeysToInvalidate={[["super-user", "assets"]]}
			/>
		</div>
	);
}
