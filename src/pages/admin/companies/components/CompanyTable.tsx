import { format } from "date-fns";
import { Building2, Eye, MoreHorizontal, Pencil, Power, Users } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { useNavigate } from "react-router";
import type { Company } from "#/entity";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
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
import { getCompanyStatusBadge } from "@/utils/badge-styles";

interface CompanyTableProps {
	companies: Company[];
	isLoading: boolean;
	onEdit?: (company: Company) => void;
	onToggleStatus?: (company: Company) => void;
}

const ROWS_PER_PAGE = 9;

// Memoized table row component to prevent unnecessary re-renders
interface CompanyRowProps {
	company: Company;
	onRowClick: (companyId: string) => void;
	onEdit?: (company: Company) => void;
	onToggleStatus?: (company: Company) => void;
}

const CompanyRow = memo(function CompanyRow({ company, onRowClick, onEdit, onToggleStatus }: CompanyRowProps) {
	return (
		<TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => onRowClick(company._id)}>
			<TableCell>
				<div className="flex items-center gap-3">
					<Avatar className="h-9 w-9 rounded-lg">
						<AvatarImage src={company.logo} alt={company.companyName} className="object-cover" />
						<AvatarFallback className="rounded-lg bg-primary/10">
							<Building2 className="h-4 w-4 text-primary" />
						</AvatarFallback>
					</Avatar>
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
			<TableCell>{getCompanyStatusBadge(company.isActive ? "active" : "inactive")}</TableCell>
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
						<DropdownMenuItem onClick={() => onRowClick(company._id)}>
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
	);
});

function CompanyTableComponent({ companies, isLoading, onEdit, onToggleStatus }: CompanyTableProps) {
	const navigate = useNavigate();
	const [currentPage, setCurrentPage] = useState(1);

	// Pagination calculations
	const totalResults = companies.length;
	const totalPages = Math.ceil(totalResults / ROWS_PER_PAGE);
	const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
	const endIndex = startIndex + ROWS_PER_PAGE;
	const paginatedCompanies = companies.slice(startIndex, endIndex);

	// Memoize callback to prevent re-renders of memoized rows
	const handleRowClick = useCallback(
		(companyId: string) => {
			navigate(`/admin/companies/${companyId}`);
		},
		[navigate],
	);

	if (isLoading) {
		return (
			<div className="rounded-md border flex flex-col h-full min-h-0">
				<div className="overflow-auto flex-1 min-h-0">
					<Table>
						<TableHeader className="sticky top-0 bg-background z-10">
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
		<div className="rounded-md border flex flex-col h-full min-h-0">
			<div className="overflow-auto flex-1 min-h-0">
				<Table>
					<TableHeader className="sticky top-0 bg-background z-10">
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
						{paginatedCompanies.map((company) => (
							<CompanyRow
								key={company._id}
								company={company}
								onRowClick={handleRowClick}
								onEdit={onEdit}
								onToggleStatus={onToggleStatus}
							/>
						))}
					</TableBody>
				</Table>
			</div>
			{totalPages > 1 && (
				<div className="flex items-center justify-between px-4 py-3 border-t">
					<div className="text-sm text-muted-foreground">
						Showing {startIndex + 1} to {Math.min(endIndex, totalResults)} of {totalResults} results
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage((prev) => prev - 1)}
							disabled={currentPage === 1}
						>
							Previous
						</Button>
						<span className="text-sm">
							Page {currentPage} of {totalPages}
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage((prev) => prev + 1)}
							disabled={currentPage === totalPages}
						>
							Next
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

// Export memoized component to prevent re-renders when parent state changes
export const CompanyTable = memo(CompanyTableComponent);
