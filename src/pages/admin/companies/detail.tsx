import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building2, Package, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import adminService from "@/api/services/adminService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { CompanyUsersTab } from "./components/CompanyUsersTab";
import { CompanyAssetsTab } from "./components/CompanyAssetsTab";
import { CompanyQRCodesTab } from "./components/CompanyQRCodesTab";

export default function CompanyDetailPage() {
	const { companyId } = useParams<{ companyId: string }>();
	const navigate = useNavigate();

	const { data: company, isLoading } = useQuery({
		queryKey: ["admin", "company", companyId],
		queryFn: () => adminService.getCompany(companyId!),
		enabled: !!companyId,
	});

	if (isLoading) {
		return (
			<div className="h-full flex flex-col overflow-hidden">
				<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
					<Skeleton className="h-10 w-64" />
				</div>
				<div className="flex-1 p-6">
					<Skeleton className="h-48 w-full" />
				</div>
			</div>
		);
	}

	if (!company) {
		return (
			<div className="h-full flex items-center justify-center">
				<p className="text-muted-foreground">Company not found</p>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={() => navigate("/admin/companies")}>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
							<Building2 className="h-5 w-5 text-primary" />
						</div>
						<div>
							<div className="flex items-center gap-2">
								<h1 className="text-xl font-semibold">{company.companyName}</h1>
								<Badge variant={company.isActive ? "default" : "secondary"}>
									{company.isActive ? "Active" : "Inactive"}
								</Badge>
							</div>
							<p className="text-sm text-muted-foreground">{company.contactEmail}</p>
						</div>
					</div>
				</div>
			</div>

			{/* Stats */}
			<div className="flex-shrink-0 px-6 py-4 border-b">
				<div className="grid grid-cols-4 gap-4">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium flex items-center gap-2">
								<Users className="h-4 w-4" /> Users
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-bold">{company.userCount || 0}</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium flex items-center gap-2">
								<Package className="h-4 w-4" /> Assets
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-bold">{company.assetCount || 0}</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">QR Codes</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-bold">{company.qrCodeCount || 0}</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">Verifications</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-bold">{company.verificationCount || 0}</p>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex-1 overflow-hidden px-6 py-4">
				<Tabs defaultValue="users" className="h-full flex flex-col">
					<TabsList>
						<TabsTrigger value="users">Users</TabsTrigger>
						<TabsTrigger value="assets">Assets</TabsTrigger>
						<TabsTrigger value="qrcodes">QR Codes</TabsTrigger>
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
