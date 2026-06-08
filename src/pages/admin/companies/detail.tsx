import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	ArrowLeft,
	Building2,
	Calendar,
	CheckCircle2,
	Download,
	FileSpreadsheet,
	FileText,
	Loader2,
	Mail,
	Package,
	Plus,
	QrCode,
	Search,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import adminService from "@/api/services/adminService";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { getCompanyStatusBadge } from "@/utils/badge-styles";
import { AddUserModal } from "./components/AddUserModal";
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
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<p className="text-xs font-medium text-muted-foreground">{label}</p>
						{isLoading ? (
							<Skeleton className="h-7 w-14" />
						) : (
							<p className="text-2xl font-bold tracking-tight">{value.toLocaleString()}</p>
						)}
					</div>
					<div className={`h-10 w-10 rounded-xl ${colorClass} flex items-center justify-center`}>{icon}</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default function CompanyDetailPage() {
	const { companyId } = useParams<{ companyId: string }>();
	const navigate = useNavigate();

	// Users tab state
	const [addUserOpen, setAddUserOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		const t = setTimeout(() => setDebouncedSearch(search), 300);
		return () => clearTimeout(t);
	}, [search]);

	// Export state
	const [exportModalOpen, setExportModalOpen] = useState(false);
	const [exportStartDate, setExportStartDate] = useState("");
	const [exportEndDate, setExportEndDate] = useState("");
	const [exportFormat, setExportFormat] = useState<"xlsx" | "pdf">("xlsx");
	const [exporting, setExporting] = useState(false);

	const handleExport = async () => {
		if (!companyId) return;
		if (!exportStartDate || !exportEndDate) {
			toast.error("Please select both start and end dates");
			return;
		}
		setExporting(true);
		try {
			await adminService.exportCompanyData(companyId, {
				startDate: exportStartDate,
				endDate: exportEndDate,
				format: exportFormat,
			});
			toast.success(`Company data exported as ${exportFormat.toUpperCase()}`);
			setExportModalOpen(false);
		} catch (error) {
			console.error("Export error:", error);
			toast.error("Failed to export company data");
		} finally {
			setExporting(false);
		}
	};

	const { data: company, isLoading: companyLoading } = useQuery({
		queryKey: ["admin", "company", companyId],
		queryFn: () => adminService.getCompany(companyId ?? ""),
		enabled: !!companyId,
	});

	const { data: companyStats, isLoading: statsLoading } = useQuery({
		queryKey: ["admin", "company-stats", companyId],
		queryFn: () => adminService.getCompanyStats(companyId ?? ""),
		enabled: !!companyId,
	});

	if (companyLoading) {
		return (
			<div className="h-full flex flex-col overflow-hidden">
				<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
					<Skeleton className="h-10 w-64" />
				</div>
				<div className="flex-1 p-6 space-y-6">
					<div className="grid grid-cols-4 gap-4">
						{["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((k) => (
							<Skeleton key={k} className="h-28 w-full rounded-lg" />
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
									{getCompanyStatusBadge(company.isActive ? "active" : "inactive")}
								</div>
								<div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
									<span className="flex items-center gap-1.5">
										<Mail className="h-3.5 w-3.5" />
										{company.contactEmail}
									</span>
									{companyStats?.company?.createdAt && (
										<span className="flex items-center gap-1.5">
											<Calendar className="h-3.5 w-3.5" />
											Joined {format(new Date(companyStats.company.createdAt), "MMM d, yyyy")}
										</span>
									)}
								</div>
							</div>
						</div>
					</div>
					<Button variant="outline" onClick={() => setExportModalOpen(true)}>
						<Download className="h-4 w-4 mr-2" />
						Export
					</Button>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="flex-shrink-0 px-6 py-3">
				<div className="grid grid-cols-4 gap-3">
					<StatCard
						icon={<Users className="h-5 w-5" />}
						label="Total Users"
						value={companyStats?.stats.users.total ?? 0}
						isLoading={statsLoading}
						colorClass="bg-blue-500/10 text-blue-600"
					/>
					<StatCard
						icon={<Package className="h-5 w-5" />}
						label="Total Assets"
						value={companyStats?.stats.assets.total ?? 0}
						isLoading={statsLoading}
						colorClass="bg-emerald-500/10 text-emerald-600"
					/>
					<StatCard
						icon={<QrCode className="h-5 w-5" />}
						label="QR Codes"
						value={companyStats?.stats.qrCodes.total ?? 0}
						isLoading={statsLoading}
						colorClass="bg-purple-500/10 text-purple-600"
					/>
					<StatCard
						icon={<CheckCircle2 className="h-5 w-5" />}
						label="Verifications"
						value={companyStats?.stats.verifications.total ?? 0}
						isLoading={statsLoading}
						colorClass="bg-orange-500/10 text-orange-600"
					/>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex-1 overflow-hidden px-6 pb-6">
				<Tabs defaultValue="users" className="h-full flex flex-col">
					<div className="flex items-center gap-3">
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
						<div className="relative w-56">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<input
								type="text"
								placeholder="Search users..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
							/>
						</div>
						<div className="ml-auto">
							<Button onClick={() => setAddUserOpen(true)}>
								<Plus className="h-4 w-4 mr-2" />
								Add User
							</Button>
						</div>
					</div>
					<TabsContent value="users" className="flex-1 overflow-hidden mt-4">
						<CompanyUsersTab companyId={companyId ?? ""} debouncedSearch={debouncedSearch} />
					</TabsContent>
					<TabsContent value="assets" className="flex-1 overflow-hidden mt-4">
						<CompanyAssetsTab companyId={companyId ?? ""} />
					</TabsContent>
					<TabsContent value="qrcodes" className="flex-1 overflow-hidden mt-4">
						<CompanyQRCodesTab companyId={companyId ?? ""} />
					</TabsContent>
				</Tabs>
			</div>
			<AddUserModal open={addUserOpen} onClose={() => setAddUserOpen(false)} companyId={companyId ?? ""} />
			{/* Export Modal */}
			<Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Export Company Data</DialogTitle>
						<DialogDescription>
							Export data for <strong>{company.companyName}</strong>. Select a date range and format.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>
									Start Date <span className="text-destructive">*</span>
								</Label>
								<Input type="date" value={exportStartDate} onChange={(e) => setExportStartDate(e.target.value)} />
							</div>
							<div className="space-y-2">
								<Label>
									End Date <span className="text-destructive">*</span>
								</Label>
								<Input type="date" value={exportEndDate} onChange={(e) => setExportEndDate(e.target.value)} />
							</div>
						</div>
						<div className="space-y-2">
							<Label>Export Format</Label>
							<Select value={exportFormat} onValueChange={(val: "xlsx" | "pdf") => setExportFormat(val)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="xlsx">
										<span className="flex items-center gap-2">
											<FileSpreadsheet className="h-4 w-4" />
											Excel (.xlsx)
										</span>
									</SelectItem>
									<SelectItem value="pdf">
										<span className="flex items-center gap-2">
											<FileText className="h-4 w-4" />
											PDF
										</span>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setExportModalOpen(false)} disabled={exporting}>
							Cancel
						</Button>
						<Button onClick={handleExport} disabled={exporting || !exportStartDate || !exportEndDate}>
							{exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
							Export
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
