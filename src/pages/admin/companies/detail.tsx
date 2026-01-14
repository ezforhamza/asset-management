import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Building2, Calendar, CheckCircle2, Mail, Package, QrCode, Settings, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import adminService from "@/api/services/adminService";
import assetService from "@/api/services/assetService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { CompanyAssetsTab } from "./components/CompanyAssetsTab";
import { CompanyQRCodesTab } from "./components/CompanyQRCodesTab";
import { CompanyUsersTab } from "./components/CompanyUsersTab";

interface StatCardProps {
	icon: React.ReactNode;
	label: string;
	value: number;
	isLoading?: boolean;
	colorClass?: string;
}

function StatCard({ icon, label, value, isLoading, colorClass = "bg-primary/10 text-primary" }: StatCardProps) {
	return (
		<Card className="relative overflow-hidden">
			<CardContent className="p-6">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground">{label}</p>
						{isLoading ? (
							<Skeleton className="h-8 w-16" />
						) : (
							<p className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</p>
						)}
					</div>
					<div className={`h-12 w-12 rounded-xl ${colorClass} flex items-center justify-center`}>{icon}</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default function CompanyDetailPage() {
	const { companyId } = useParams<{ companyId: string }>();
	const navigate = useNavigate();

	const { data: company, isLoading: companyLoading } = useQuery({
		queryKey: ["admin", "company", companyId],
		queryFn: () => adminService.getCompany(companyId!),
		enabled: !!companyId,
	});

	const { data: summaryData, isLoading: summaryLoading } = useQuery({
		queryKey: ["admin", "companies-summary"],
		queryFn: () => adminService.getCompanySummary(),
		enabled: !!companyId,
	});

	const { data: usersData, isLoading: usersLoading } = useQuery({
		queryKey: ["admin", "company-users", companyId],
		queryFn: () => adminService.getAdminUsers({ companyId }),
		enabled: !!companyId,
	});

	const { data: assetsData, isLoading: assetsLoading } = useQuery({
		queryKey: ["assets", "company", companyId],
		queryFn: () => assetService.getAssets({ companyId }),
		enabled: !!companyId,
	});

	const { data: qrCodesData, isLoading: qrCodesLoading } = useQuery({
		queryKey: ["admin", "company-qrcodes", companyId],
		queryFn: () => adminService.getAdminQRCodes({ companyId }),
		enabled: !!companyId,
	});

	const companySummary = summaryData?.companies?.find((c) => c._id === companyId);

	const stats = {
		totalUsers: usersData?.results?.length ?? companySummary?.userCount ?? 0,
		totalAssets: assetsData?.results?.length ?? companySummary?.assetCount ?? 0,
		totalQRCodes: qrCodesData?.results?.length ?? 0,
		totalVerifications: companySummary?.verificationCount ?? 0,
	};

	const statsLoading = usersLoading || assetsLoading || qrCodesLoading || summaryLoading;

	if (companyLoading) {
		return (
			<div className="h-full flex flex-col overflow-hidden">
				<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
					<Skeleton className="h-10 w-64" />
				</div>
				<div className="flex-1 p-6 space-y-6">
					<div className="grid grid-cols-4 gap-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton key={i} className="h-28 w-full rounded-lg" />
						))}
					</div>
					<Skeleton className="h-64 w-full" />
				</div>
			</div>
		);
	}

	if (!company) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="text-center">
					<Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
					<p className="text-lg font-medium">Company not found</p>
					<p className="text-sm text-muted-foreground mb-4">The company you're looking for doesn't exist.</p>
					<Button onClick={() => navigate("/admin/companies")}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Companies
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col overflow-hidden bg-background">
			{/* Enhanced Header */}
			<div className="flex-shrink-0 px-6 py-5 border-b bg-gradient-to-r from-card to-card/80">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" onClick={() => navigate("/admin/companies")} className="hover:bg-muted">
							<ArrowLeft className="h-5 w-5" />
						</Button>
						<div className="flex items-center gap-4">
							<div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
								<Building2 className="h-7 w-7 text-primary-foreground" />
							</div>
							<div>
								<div className="flex items-center gap-3">
									<h1 className="text-2xl font-bold">{company.companyName}</h1>
									<Badge
										variant={company.isActive ? "default" : "secondary"}
										className={company.isActive ? "bg-green-600 hover:bg-green-700" : ""}
									>
										{company.isActive ? "Active" : "Inactive"}
									</Badge>
								</div>
								<div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
									<span className="flex items-center gap-1.5">
										<Mail className="h-3.5 w-3.5" />
										{company.contactEmail}
									</span>
									{companySummary?.createdAt && (
										<span className="flex items-center gap-1.5">
											<Calendar className="h-3.5 w-3.5" />
											Joined {format(new Date(companySummary.createdAt), "MMM d, yyyy")}
										</span>
									)}
								</div>
							</div>
						</div>
					</div>
					<Button variant="outline" size="sm" className="gap-2">
						<Settings className="h-4 w-4" />
						Company Settings
					</Button>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="flex-shrink-0 px-6 py-5">
				<div className="grid grid-cols-4 gap-4">
					<StatCard
						icon={<Users className="h-6 w-6" />}
						label="Total Users"
						value={stats.totalUsers}
						isLoading={statsLoading}
						colorClass="bg-blue-500/10 text-blue-600"
					/>
					<StatCard
						icon={<Package className="h-6 w-6" />}
						label="Total Assets"
						value={stats.totalAssets}
						isLoading={statsLoading}
						colorClass="bg-emerald-500/10 text-emerald-600"
					/>
					<StatCard
						icon={<QrCode className="h-6 w-6" />}
						label="QR Codes"
						value={stats.totalQRCodes}
						isLoading={statsLoading}
						colorClass="bg-purple-500/10 text-purple-600"
					/>
					<StatCard
						icon={<CheckCircle2 className="h-6 w-6" />}
						label="Verifications"
						value={stats.totalVerifications}
						isLoading={statsLoading}
						colorClass="bg-orange-500/10 text-orange-600"
					/>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex-1 overflow-hidden px-6 pb-6">
				<Tabs defaultValue="users" className="h-full flex flex-col">
					<TabsList className="w-fit">
						<TabsTrigger value="users" className="gap-2">
							<Users className="h-4 w-4" />
							Users
						</TabsTrigger>
						<TabsTrigger value="assets" className="gap-2">
							<Package className="h-4 w-4" />
							Assets
						</TabsTrigger>
						<TabsTrigger value="qrcodes" className="gap-2">
							<QrCode className="h-4 w-4" />
							QR Codes
						</TabsTrigger>
					</TabsList>
					<TabsContent value="users" className="flex-1 overflow-hidden mt-4">
						<CompanyUsersTab companyId={companyId!} />
					</TabsContent>
					<TabsContent value="assets" className="flex-1 overflow-hidden mt-4">
						<CompanyAssetsTab companyId={companyId!} />
					</TabsContent>
					<TabsContent value="qrcodes" className="flex-1 overflow-hidden mt-4">
						<CompanyQRCodesTab companyId={companyId!} />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
