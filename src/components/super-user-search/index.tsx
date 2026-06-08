import { useQuery } from "@tanstack/react-query";
import { Building2, Package, Search, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { UserRole } from "#/enum";
import searchService from "@/api/services/searchService";
import { useUserInfo } from "@/store/userStore";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";

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
		queryKey: ["global-search", debouncedQuery],
		queryFn: () => searchService.search(debouncedQuery, "all", 8),
		enabled: debouncedQuery.length >= 2,
	});

	if (userInfo.role !== UserRole.SUPER_USER && userInfo.role !== UserRole.SYSTEM_ADMIN) return null;

	const users = data?.results?.users?.results ?? [];
	const assets = data?.results?.assets?.results ?? [];
	const qrcodes = data?.results?.qrcodes?.results ?? [];
	const hasResults = users.length > 0 || assets.length > 0 || qrcodes.length > 0;

	const basePath = userInfo.role === UserRole.SUPER_USER ? "/super-user" : "/admin";

	const handleSelectAsset = (companyId: string, assetId: string) => {
		navigate(`${basePath}/companies/${companyId}/assets/${assetId}`);
		setQuery("");
		setOpen(false);
	};

	const handleSelectUser = (companyId: string, userId: string) => {
		navigate(`${basePath}/companies/${companyId}/users/${userId}`);
		setQuery("");
		setOpen(false);
	};

	return (
		<div ref={containerRef} className="relative w-64">
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
				<Input
					placeholder="Search users, assets, QR codes..."
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
				<div className="absolute top-full mt-1 left-0 w-96 bg-popover border rounded-md shadow-lg z-50 overflow-hidden max-h-[480px] overflow-y-auto">
					{isFetching ? (
						<div className="p-2 space-y-2">
							{Array.from({ length: 4 }).map((_, i) => (
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
					) : !hasResults ? (
						<p className="text-sm text-muted-foreground text-center py-6">No results for "{debouncedQuery}"</p>
					) : (
						<div className="divide-y">
							{/* Users */}
							{users.length > 0 && (
								<div>
									<p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted/40">
										Users{" "}
										{data?.results?.users?.total && data.results.users.total > users.length
											? `(${data.results.users.total} total)`
											: ""}
									</p>
									<ul>
										{users.map((user) => (
											<li key={user.id}>
												<button
													type="button"
													className="w-full text-left px-3 py-2.5 hover:bg-muted/60 transition-colors flex items-start gap-3"
													onClick={() => handleSelectUser(user.companyId, user.id)}
												>
													<User className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium truncate">{user.name}</p>
														<p className="text-xs text-muted-foreground truncate">{user.email}</p>
														{user.companyName && (
															<div className="flex items-center gap-1 mt-0.5">
																<Building2 className="h-3 w-3 text-muted-foreground" />
																<p className="text-xs text-muted-foreground truncate">{user.companyName}</p>
															</div>
														)}
													</div>
												</button>
											</li>
										))}
									</ul>
								</div>
							)}

							{/* Assets */}
							{assets.length > 0 && (
								<div>
									<p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted/40">
										Assets{" "}
										{data?.results?.assets?.total && data.results.assets.total > assets.length
											? `(${data.results.assets.total} total)`
											: ""}
									</p>
									<ul>
										{assets.map((asset) => (
											<li key={asset.id}>
												<button
													type="button"
													className="w-full text-left px-3 py-2.5 hover:bg-muted/60 transition-colors flex items-start gap-3"
													onClick={() => handleSelectAsset(asset.companyId, asset.id)}
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
								</div>
							)}

							{/* QR Codes */}
							{qrcodes.length > 0 && (
								<div>
									<p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted/40">
										QR Codes{" "}
										{data?.results?.qrcodes?.total && data.results.qrcodes.total > qrcodes.length
											? `(${data.results.qrcodes.total} total)`
											: ""}
									</p>
									<ul>
										{qrcodes.map((qr) => (
											<li key={qr.id}>
												<div className="px-3 py-2.5 flex items-start gap-3">
													<Search className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
													<div className="flex-1 min-w-0">
														<p className="font-medium text-sm font-mono truncate">{qr.qrCode}</p>
														{qr.assetSerialNumber && (
															<p className="text-xs text-muted-foreground truncate">Asset: {qr.assetSerialNumber}</p>
														)}
														{qr.companyName && (
															<div className="flex items-center gap-1 mt-0.5">
																<Building2 className="h-3 w-3 text-muted-foreground" />
																<p className="text-xs text-muted-foreground truncate">{qr.companyName}</p>
															</div>
														)}
													</div>
												</div>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
