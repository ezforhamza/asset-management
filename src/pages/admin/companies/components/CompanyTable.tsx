import { format } from "date-fns";
import { Building2, Eye, MoreHorizontal, Pencil, Power, Users } from "lucide-react";
import { useNavigate } from "react-router";
import type { Company } from "#/entity";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

interface CompanyTableProps {
	companies: Company[];
	isLoading: boolean;
	onEdit?: (company: Company) => void;
	onToggleStatus?: (company: Company) => void;
}

export function CompanyTable({ companies, isLoading, onEdit, onToggleStatus }: CompanyTableProps) {
	const navigate = useNavigate();

	const handleRowClick = (companyId: string) => {
		navigate(`/admin/companies/${companyId}`);
	};

	if (isLoading) {
		return (
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Company</TableHead>
							<TableHead>Contact</TableHead>
							<TableHead className="text-center">Assets</TableHead>
							<TableHead className="text-center">Users</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Created</TableHead>
							<TableHead className="w-[50px]" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: 5 }).map((_, i) => (
							<TableRow key={i}>
								<TableCell>
									<Skeleton className="h-5 w-40" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-48" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-12 mx-auto" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-12 mx-auto" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-16" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-24" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-8 w-8" />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		);
	}

	if (companies.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-center">
				<Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
				<h3 className="text-lg font-medium">No companies found</h3>
				<p className="text-sm text-muted-foreground">Get started by adding your first company.</p>
			</div>
		);
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Company</TableHead>
						<TableHead>Contact</TableHead>
						<TableHead className="text-center">Assets</TableHead>
						<TableHead className="text-center">Users</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Created</TableHead>
						<TableHead className="w-[50px]" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{companies.map((company) => (
						<TableRow
							key={company._id}
							className="cursor-pointer hover:bg-muted/50"
							onClick={() => handleRowClick(company._id)}
						>
							<TableCell>
								<div className="flex items-center gap-3">
									<div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
										<Building2 className="h-4 w-4 text-primary" />
									</div>
									<div>
										<p className="font-medium">{company.companyName}</p>
										{company.address && (
											<p className="text-xs text-muted-foreground truncate max-w-[200px]">{company.address}</p>
										)}
									</div>
								</div>
							</TableCell>
							<TableCell>
								<div>
									<p className="text-sm">{company.contactEmail}</p>
									{company.phone && <p className="text-xs text-muted-foreground">{company.phone}</p>}
								</div>
							</TableCell>
							<TableCell className="text-center">
								<span className="font-medium">{company.totalAssets ?? 0}</span>
							</TableCell>
							<TableCell className="text-center">
								<div className="flex items-center justify-center gap-1">
									<Users className="h-3.5 w-3.5 text-muted-foreground" />
									<span className="font-medium">{company.totalUsers ?? 0}</span>
								</div>
							</TableCell>
							<TableCell>
								<Badge variant={company.isActive ? "default" : "secondary"}>
									{company.isActive ? "Active" : "Inactive"}
								</Badge>
							</TableCell>
							<TableCell className="text-sm text-muted-foreground">
								{company.createdAt ? format(new Date(company.createdAt), "MMM d, yyyy") : "N/A"}
							</TableCell>
							<TableCell onClick={(e) => e.stopPropagation()}>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="h-8 w-8">
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => handleRowClick(company._id)}>
											<Eye className="h-4 w-4 mr-2" />
											View Details
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => onEdit?.(company)}>
											<Pencil className="h-4 w-4 mr-2" />
											Edit
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={() => onToggleStatus?.(company)}>
											<Power className="h-4 w-4 mr-2" />
											{company.isActive ? "Deactivate" : "Activate"}
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
