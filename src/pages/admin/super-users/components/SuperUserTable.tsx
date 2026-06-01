import { format } from "date-fns";
import { Bell, Building2, KeyRound, MoreHorizontal, Trash2, UserCheck, UserX } from "lucide-react";
import type { UserInfo } from "#/entity";
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
import { getUserStatusBadge, StyledBadge } from "@/utils/badge-styles";

interface SuperUserTableProps {
	users: UserInfo[];
	isLoading: boolean;
	onChangePassword: (user: UserInfo) => void;
	onDeactivate: (user: UserInfo) => void;
	onActivate: (user: UserInfo) => void;
	onNotifications: (user: UserInfo) => void;
	onManageCompanies: (user: UserInfo) => void;
	onDelete: (user: UserInfo) => void;
}

function SuperUserTypeBadge({ type }: { type?: string | null }) {
	if (type === "read_write") return <StyledBadge color="blue">Read-Write</StyledBadge>;
	return <StyledBadge color="gray">Read-Only</StyledBadge>;
}

export function SuperUserTable({
	users,
	isLoading,
	onChangePassword,
	onDeactivate,
	onActivate,
	onNotifications,
	onManageCompanies,
	onDelete,
}: SuperUserTableProps) {
	if (isLoading) {
		return (
			<div className="rounded-md border h-full overflow-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Created At</TableHead>
							<TableHead>Last Login</TableHead>
							<TableHead className="w-[50px]" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: 4 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
							<TableRow key={i}>
								<TableCell>
									<Skeleton className="h-5 w-36" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-44" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-20" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-16" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-24" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-32" />
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

	if (users.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-center">
				<h3 className="text-lg font-medium">No super users yet</h3>
				<p className="text-sm text-muted-foreground mt-1">Create your first support team member above.</p>
			</div>
		);
	}

	return (
		<div className="rounded-md border h-full overflow-auto">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Type</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Created At</TableHead>
						<TableHead>Last Login</TableHead>
						<TableHead className="w-[50px]" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.map((user) => (
						<TableRow key={user.id}>
							<TableCell>
								<div className="flex items-center gap-3">
									<Avatar className="h-8 w-8">
										<AvatarImage src={user.profilePic || undefined} alt={user.name} />
										<AvatarFallback className="bg-primary/10 text-primary text-xs">
											{user.name?.slice(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<span className="font-medium">{user.name}</span>
								</div>
							</TableCell>
							<TableCell className="text-muted-foreground">{user.email}</TableCell>
							<TableCell>
								<SuperUserTypeBadge type={user.superUserType} />
							</TableCell>
							<TableCell>{getUserStatusBadge(user.status !== "inactive" ? "active" : "inactive")}</TableCell>
							<TableCell className="text-sm text-muted-foreground">
								{(() => {
									const createdAt = (user as UserInfo & { createdAt?: string }).createdAt;
									return createdAt ? format(new Date(createdAt), "MMM d, yyyy") : "—";
								})()}
							</TableCell>
							<TableCell className="text-sm text-muted-foreground">
								{user.lastLogin ? format(new Date(user.lastLogin), "MMM d, yyyy HH:mm") : "Never"}
							</TableCell>
							<TableCell>
								<DropdownMenu modal={false}>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="h-8 w-8">
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => onChangePassword(user)}>
											<KeyRound className="h-4 w-4 mr-2" />
											Change Password
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => onManageCompanies(user)}>
											<Building2 className="h-4 w-4 mr-2" />
											Manage Companies
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => onNotifications(user)}>
											<Bell className="h-4 w-4 mr-2" />
											Notifications
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										{user.status !== "inactive" ? (
											<DropdownMenuItem
												onClick={() => onDeactivate(user)}
												className="text-destructive focus:text-destructive"
											>
												<UserX className="h-4 w-4 mr-2" />
												Deactivate
											</DropdownMenuItem>
										) : (
											<DropdownMenuItem
												onClick={() => onActivate(user)}
												className="text-emerald-600 focus:text-emerald-600"
											>
												<UserCheck className="h-4 w-4 mr-2" />
												Activate
											</DropdownMenuItem>
										)}
										<DropdownMenuItem onClick={() => onDelete(user)} className="text-red-500 focus:text-red-500">
											<Trash2 className="h-4 w-4 mr-2" />
											Delete
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
