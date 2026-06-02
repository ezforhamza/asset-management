import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import adminService from "@/api/services/adminService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

interface CompanyFilterProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export function CompanyFilter({ value, onChange, placeholder = "All Companies" }: CompanyFilterProps) {
	const { data } = useQuery({
		queryKey: ["super-user", "companies-for-filter"],
		queryFn: () => adminService.getCompanies({ limit: 100 }),
		staleTime: 5 * 60 * 1000,
	});

	const companies = data?.results || [];

	return (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger className="w-[190px]">
				<Building2 className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="all">All Companies</SelectItem>
				{companies.map((c) => (
					<SelectItem key={c._id} value={c._id}>
						{c.companyName}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
