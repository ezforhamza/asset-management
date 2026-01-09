import { UserCheck, UserX, Users } from "lucide-react";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

interface BulkAllocationToolbarProps {
	selectedCount: number;
	onAllocate: () => void;
	onReassign: () => void;
	onUnallocate: () => void;
	onClearSelection: () => void;
}

export function BulkAllocationToolbar({
	selectedCount,
	onAllocate,
	onReassign,
	onUnallocate,
	onClearSelection,
}: BulkAllocationToolbarProps) {
	if (selectedCount === 0) return null;

	return (
		<div className="flex items-center justify-between px-6 py-3 bg-primary/5 border-b">
			<div className="flex items-center gap-3">
				<Badge variant="secondary" className="text-sm font-medium">
					{selectedCount} asset{selectedCount !== 1 ? "s" : ""} selected
				</Badge>
				<Button variant="ghost" size="sm" onClick={onClearSelection}>
					Clear Selection
				</Button>
			</div>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button>
						<Users className="h-4 w-4 mr-2" />
						Bulk Actions
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-48">
					<DropdownMenuItem onClick={onAllocate}>
						<UserCheck className="h-4 w-4 mr-2" />
						Allocate to Worker
					</DropdownMenuItem>
					<DropdownMenuItem onClick={onReassign}>
						<UserCheck className="h-4 w-4 mr-2" />
						Reassign to Worker
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={onUnallocate} className="text-destructive">
						<UserX className="h-4 w-4 mr-2" />
						Unallocate Assets
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
