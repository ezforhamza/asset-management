import { useQuery } from "@tanstack/react-query";
import { Building2, Package, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import type { Asset } from "#/entity";
import { UserRole } from "#/enum";
import assetService from "@/api/services/assetService";
import { useUserInfo } from "@/store/userStore";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";

type AssetWithCompany = Asset & { companyId?: string; companyName?: string };

export function SuperUserSearch() {
	const userInfo = useUserInfo();
	const navigate = useNavigate();
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const t = setTimeout(() => setDebouncedQuery(query), 300);
		return () => clearTimeout(t);
	}, [query]);

	useEffect(() => {
		setOpen(debouncedQuery.length >= 2);
	}, [debouncedQuery]);

	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	const { data, isFetching } = useQuery({
		queryKey: ["super-user", "global-search", debouncedQuery],
		queryFn: () => assetService.getAssets({ search: debouncedQuery, limit: 8 }),
		enabled: debouncedQuery.length >= 2,
	});

	if (userInfo.role !== UserRole.SUPER_USER) return null;

	const results = (data?.results || []) as AssetWithCompany[];

	const handleSelect = (asset: AssetWithCompany) => {
		const companyId = asset.companyId || "";
		const assetId = asset.id || asset._id || "";
		navigate(`/super-user/companies/${companyId}/assets/${assetId}`);
		setQuery("");
		setOpen(false);
	};

	return (
		<div ref={containerRef} className="relative w-64">
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
				<Input
					placeholder="Search all assets..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="pl-9 pr-8 h-8 text-sm"
					onFocus={() => debouncedQuery.length >= 2 && setOpen(true)}
				/>
				{query && (
					<button
						type="button"
						onClick={() => {
							setQuery("");
							setOpen(false);
						}}
						className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					>
						<X className="h-3.5 w-3.5" />
					</button>
				)}
			</div>

			{open && (
				<div className="absolute top-full mt-1 left-0 w-80 bg-popover border rounded-md shadow-lg z-50 overflow-hidden">
					{isFetching ? (
						<div className="p-2 space-y-2">
							{Array.from({ length: 3 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
								<div key={i} className="flex gap-2 p-2">
									<Skeleton className="h-4 w-4 mt-0.5" />
									<div className="flex-1 space-y-1.5">
										<Skeleton className="h-3 w-24" />
										<Skeleton className="h-3 w-40" />
									</div>
								</div>
							))}
						</div>
					) : results.length === 0 ? (
						<p className="text-sm text-muted-foreground text-center py-6">No assets found for "{debouncedQuery}"</p>
					) : (
						<ul>
							{results.map((asset) => (
								<li key={asset.id || asset._id}>
									<button
										type="button"
										className="w-full text-left px-3 py-2.5 hover:bg-muted/60 transition-colors flex items-start gap-3"
										onClick={() => handleSelect(asset)}
									>
										<Package className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
										<div className="flex-1 min-w-0">
											<p className="font-medium text-sm font-mono truncate">{asset.serialNumber}</p>
											<p className="text-xs text-muted-foreground truncate">
												{asset.make} {asset.model}
											</p>
											{asset.companyName && (
												<div className="flex items-center gap-1 mt-0.5">
													<Building2 className="h-3 w-3 text-muted-foreground" />
													<p className="text-xs text-muted-foreground truncate">{asset.companyName}</p>
												</div>
											)}
										</div>
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
			)}
		</div>
	);
}
