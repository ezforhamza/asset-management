import { LogOut } from "lucide-react";
import { useLoginStateContext } from "@/pages/sys/login/providers/login-provider";
import { useRouter } from "@/routes/hooks";
import { useUserActions, useUserInfo } from "@/store/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

/**
 * Account Dropdown - Simplified
 */
export default function AccountDropdown() {
	const { replace } = useRouter();
	const userInfo = useUserInfo();
	const { username, email, avatar } = userInfo;
	const profilePic = userInfo.profilePic || avatar;
	const { clearUserInfoAndToken } = useUserActions();
	const { backToLogin } = useLoginStateContext();

	const logout = () => {
		try {
			clearUserInfoAndToken();
			backToLogin();
		} catch (error) {
			console.log(error);
		} finally {
			replace("/auth/login");
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" className="rounded-full gap-2 pl-1 pr-3">
					<Avatar className="h-7 w-7">
						<AvatarImage src={profilePic || undefined} alt={username} />
						<AvatarFallback className="text-xs">{username?.charAt(0).toUpperCase()}</AvatarFallback>
					</Avatar>
					<span className="hidden sm:inline text-sm font-medium">{username}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<div className="flex items-center gap-3 p-3">
					<Avatar className="h-10 w-10">
						<AvatarImage src={profilePic || undefined} alt={username} />
						<AvatarFallback>{username?.charAt(0).toUpperCase()}</AvatarFallback>
					</Avatar>
					<div className="flex flex-col">
						<span className="text-sm font-medium">{username}</span>
						<span className="text-xs text-muted-foreground">{email}</span>
					</div>
				</div>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="text-destructive" onClick={logout}>
					<LogOut className="h-4 w-4 mr-2" />
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
