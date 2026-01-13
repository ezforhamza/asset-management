import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { Loader2, Monitor, Smartphone, Trash2, Wifi, WifiOff, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserInfo } from "#/entity";
import sessionService, { type Session } from "@/api/services/sessionService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui/dialog";
import { ScrollArea } from "@/ui/scroll-area";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

interface ViewSessionsModalProps {
	user: UserInfo | null;
	open: boolean;
	onClose: () => void;
}

const getDeviceIcon = (userAgent: string) => {
	const ua = userAgent.toLowerCase();
	if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
		return <Smartphone className="h-4 w-4" />;
	}
	return <Monitor className="h-4 w-4" />;
};

const parseDeviceInfo = (userAgent: string): string => {
	const ua = userAgent.toLowerCase();

	// Check for mobile devices
	if (ua.includes("iphone")) return "iPhone";
	if (ua.includes("ipad")) return "iPad";
	if (ua.includes("android")) {
		if (ua.includes("mobile")) return "Android Phone";
		return "Android Tablet";
	}

	// Check for desktop browsers
	if (ua.includes("windows")) return "Windows PC";
	if (ua.includes("macintosh") || ua.includes("mac os")) return "Mac";
	if (ua.includes("linux")) return "Linux";

	return "Unknown Device";
};

const parseBrowser = (userAgent: string): string => {
	const ua = userAgent.toLowerCase();

	if (ua.includes("chrome") && !ua.includes("edg")) return "Chrome";
	if (ua.includes("firefox")) return "Firefox";
	if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
	if (ua.includes("edg")) return "Edge";
	if (ua.includes("opera") || ua.includes("opr")) return "Opera";

	return "Browser";
};

export function ViewSessionsModal({ user, open, onClose }: ViewSessionsModalProps) {
	const queryClient = useQueryClient();
	const [terminatingSessionId, setTerminatingSessionId] = useState<string | null>(null);

	const { data, isLoading, error } = useQuery({
		queryKey: ["user-sessions", user?.id],
		queryFn: () => sessionService.getUserSessions(user?.id ?? ""),
		enabled: !!user?.id && open,
	});

	const handleTerminateSession = async (sessionId: string) => {
		setTerminatingSessionId(sessionId);
		try {
			await sessionService.terminateSession(sessionId);
			toast.success("Session terminated successfully");
			// Optimistically update the UI - data is { results: Session[], ... }
			queryClient.setQueryData(["user-sessions", user?.id], (oldData: typeof data) => {
				if (!oldData?.results) return oldData;
				return {
					...oldData,
					results: oldData.results.map((s: Session) => (s.id === sessionId ? { ...s, isActive: false } : s)),
				};
			});
			// Also refetch to get latest data
			queryClient.invalidateQueries({ queryKey: ["user-sessions", user?.id] });
			queryClient.invalidateQueries({ queryKey: ["session-users"] });
		} catch {
			toast.error("Failed to terminate session");
		} finally {
			setTerminatingSessionId(null);
		}
	};

	// Backend returns { results: Session[], page, limit, ... }
	const sessions: Session[] = data?.results ?? [];
	const activeSessions = sessions.filter((s: Session) => s.isActive === true);

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent className="max-w-3xl max-h-[80vh]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<span>Sessions for {user?.name}</span>
						{activeSessions.length > 0 ? (
							<Badge variant="default" className="bg-emerald-500">
								<Wifi className="h-3 w-3 mr-1" />
								{activeSessions.length} Active
							</Badge>
						) : (
							<Badge variant="secondary">
								<WifiOff className="h-3 w-3 mr-1" />
								Offline
							</Badge>
						)}
					</DialogTitle>
					<DialogDescription>
						View and manage active sessions for this user. Terminate sessions to force logout from specific devices.
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="max-h-[500px]">
					{isLoading ? (
						<div className="space-y-3 p-4">
							{Array.from({ length: 3 }).map((_, idx) => (
								<Skeleton key={`skeleton-${idx}`} className="h-16 w-full" />
							))}
						</div>
					) : error ? (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<X className="h-8 w-8 text-destructive mb-2" />
							<p className="text-sm text-muted-foreground">Failed to load sessions</p>
						</div>
					) : sessions.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<WifiOff className="h-8 w-8 text-muted-foreground mb-2" />
							<p className="text-sm text-muted-foreground">No sessions found for this user</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Device</TableHead>
									<TableHead>IP Address</TableHead>
									<TableHead>Created</TableHead>
									<TableHead>Last Activity</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sessions.map((session: Session) => (
									<TableRow key={session.id} className={!session.isActive ? "opacity-50" : ""}>
										<TableCell>
											<div className="flex items-center gap-2">
												{getDeviceIcon(session.userAgent)}
												<div>
													<p className="font-medium text-sm">{parseDeviceInfo(session.userAgent)}</p>
													<p className="text-xs text-muted-foreground">{parseBrowser(session.userAgent)}</p>
												</div>
											</div>
										</TableCell>
										<TableCell className="font-mono text-sm">{session.ipAddress}</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{session.createdAt && !Number.isNaN(new Date(session.createdAt).getTime())
												? format(new Date(session.createdAt), "MMM d, yyyy HH:mm")
												: "—"}
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{session.lastActivityAt && !Number.isNaN(new Date(session.lastActivityAt).getTime())
												? formatDistanceToNow(new Date(session.lastActivityAt), { addSuffix: true })
												: "—"}
										</TableCell>
										<TableCell>
											{session.isActive ? (
												<Badge variant="default" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
													Active
												</Badge>
											) : (
												<Badge variant="secondary">Terminated</Badge>
											)}
										</TableCell>
										<TableCell className="text-right">
											{session.isActive && (
												<Button
													variant="ghost"
													size="sm"
													className="text-destructive hover:text-destructive hover:bg-destructive/10"
													onClick={() => handleTerminateSession(session.id)}
													disabled={terminatingSessionId === session.id}
												>
													{terminatingSessionId === session.id ? (
														<Loader2 className="h-4 w-4 animate-spin" />
													) : (
														<Trash2 className="h-4 w-4" />
													)}
												</Button>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}

export default ViewSessionsModal;
