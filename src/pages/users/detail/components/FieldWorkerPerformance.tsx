import { useQuery } from "@tanstack/react-query";
import { endOfDay, format, startOfDay, subDays } from "date-fns";
import {
	Calendar,
	CalendarDays,
	Camera,
	CheckCircle2,
	Filter,
	Loader2,
	Mail,
	MapPin,
	MapPinOff,
	RefreshCw,
	User,
	Wrench,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import type { UserInfo } from "#/entity";
import reportService from "@/api/services/reportService";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Progress } from "@/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

interface FieldWorkerPerformanceProps {
	userId: string;
	user: UserInfo;
}

type DatePreset = "all" | "today" | "7days" | "30days" | "custom";

export function FieldWorkerPerformance({ userId, user }: FieldWorkerPerformanceProps) {
	const [datePreset, setDatePreset] = useState<DatePreset>("all");
	const [customStartDate, setCustomStartDate] = useState<string>("");
	const [customEndDate, setCustomEndDate] = useState<string>("");

	// Calculate date params based on preset
	const getDateParams = () => {
		const now = new Date();
		switch (datePreset) {
			case "today":
				return {
					startDate: startOfDay(now).toISOString(),
					endDate: endOfDay(now).toISOString(),
				};
			case "7days":
				return {
					startDate: startOfDay(subDays(now, 7)).toISOString(),
					endDate: endOfDay(now).toISOString(),
				};
			case "30days":
				return {
					startDate: startOfDay(subDays(now, 30)).toISOString(),
					endDate: endOfDay(now).toISOString(),
				};
			case "custom":
				if (customStartDate && customEndDate) {
					return {
						startDate: startOfDay(new Date(customStartDate)).toISOString(),
						endDate: endOfDay(new Date(customEndDate)).toISOString(),
					};
				}
				return {};
			default:
				return {};
		}
	};

	const dateParams = getDateParams();

	// Fetch field worker performance data
	const { data, isLoading, error } = useQuery({
		queryKey: ["field-worker-performance", userId, dateParams.startDate, dateParams.endDate],
		queryFn: () => reportService.getFieldWorkerPerformance(userId, dateParams),
	});

	const performanceData = data?.fieldWorker;

	// Loading state
	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-12 gap-2">
				<XCircle className="h-8 w-8 text-destructive" />
				<p className="text-destructive">Failed to load performance data</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Top Summary Card with User Info */}
			<Card>
				<CardHeader>
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
						<div className="flex items-center gap-4">
							<Avatar className="h-16 w-16">
								<AvatarImage src={user.profilePic || undefined} alt={user.name} />
								<AvatarFallback className="text-lg">{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
							</Avatar>
							<div>
								<CardTitle className="text-xl">{performanceData?.name || user.name}</CardTitle>
								<div className="flex items-center gap-2 text-muted-foreground mt-1">
									<Mail className="h-4 w-4" />
									<span className="text-sm">{performanceData?.email || user.email}</span>
								</div>
								<Badge variant="secondary" className="mt-2">
									<User className="h-3 w-3 mr-1" />
									Field Worker
								</Badge>
							</div>
						</div>
						<div className="text-right">
							<div className="text-4xl font-bold text-primary">{performanceData?.totalVerifications ?? 0}</div>
							<p className="text-sm text-muted-foreground">Total Verifications</p>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-4">
						<div className="flex-1">
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium">GPS Pass Rate</span>
								<span className="text-sm font-bold text-emerald-600">
									{performanceData?.gpsPassRate?.toFixed(1) ?? 0}%
								</span>
							</div>
							<Progress value={performanceData?.gpsPassRate ?? 0} className="h-2" />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Date Filter Card */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-lg flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Filter by Date Range
					</CardTitle>
					<CardDescription>View performance metrics for a specific time period</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap items-end gap-4">
						<div className="space-y-2">
							<Label>Date Range</Label>
							<Select value={datePreset} onValueChange={(v) => setDatePreset(v as DatePreset)}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Select range" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Time</SelectItem>
									<SelectItem value="today">Today</SelectItem>
									<SelectItem value="7days">Last 7 Days</SelectItem>
									<SelectItem value="30days">Last 30 Days</SelectItem>
									<SelectItem value="custom">Custom Range</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{datePreset === "custom" && (
							<>
								<div className="space-y-2">
									<Label>Start Date</Label>
									<Input
										type="date"
										value={customStartDate}
										onChange={(e) => setCustomStartDate(e.target.value)}
										className="w-[160px]"
									/>
								</div>
								<div className="space-y-2">
									<Label>End Date</Label>
									<Input
										type="date"
										value={customEndDate}
										onChange={(e) => setCustomEndDate(e.target.value)}
										className="w-[160px]"
									/>
								</div>
							</>
						)}

						{datePreset !== "all" && (
							<Button variant="outline" size="sm" onClick={() => setDatePreset("all")}>
								Clear Filter
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Performance Metrics Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{/* Total Verifications */}
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 rounded-full bg-primary/10">
								<CheckCircle2 className="h-6 w-6 text-primary" />
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Total Verifications</p>
								<p className="text-2xl font-bold">{performanceData?.totalVerifications ?? 0}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* GPS Passed */}
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 rounded-full bg-emerald-500/10">
								<MapPin className="h-6 w-6 text-emerald-500" />
							</div>
							<div>
								<p className="text-sm text-muted-foreground">GPS Passed</p>
								<p className="text-2xl font-bold text-emerald-600">{performanceData?.gpsPassedCount ?? 0}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* GPS Failed */}
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 rounded-full bg-red-500/10">
								<MapPinOff className="h-6 w-6 text-red-500" />
							</div>
							<div>
								<p className="text-sm text-muted-foreground">GPS Failed</p>
								<p className="text-2xl font-bold text-red-600">{performanceData?.gpsFailedCount ?? 0}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* GPS Override */}
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 rounded-full bg-orange-500/10">
								<RefreshCw className="h-6 w-6 text-orange-500" />
							</div>
							<div>
								<p className="text-sm text-muted-foreground">GPS Override</p>
								<p className="text-2xl font-bold text-orange-600">{performanceData?.gpsOverrideCount ?? 0}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Repairs Flagged */}
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 rounded-full bg-yellow-500/10">
								<Wrench className="h-6 w-6 text-yellow-500" />
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Repairs Flagged</p>
								<p className="text-2xl font-bold text-yellow-600">{performanceData?.repairsFlaggedCount ?? 0}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Avg Photos per Verification */}
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 rounded-full bg-blue-500/10">
								<Camera className="h-6 w-6 text-blue-500" />
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Avg Photos/Verification</p>
								<p className="text-2xl font-bold text-blue-600">
									{performanceData?.avgPhotosPerVerification?.toFixed(1) ?? "0"}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Verification Timeline */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<CalendarDays className="h-5 w-5" />
						Verification Timeline
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="flex items-center gap-4">
							<div className="p-3 rounded-full bg-green-500/10">
								<Calendar className="h-5 w-5 text-green-500" />
							</div>
							<div>
								<p className="text-sm text-muted-foreground">First Verification</p>
								<p className="font-medium">
									{performanceData?.firstVerification
										? format(new Date(performanceData.firstVerification), "MMM d, yyyy 'at' h:mm a")
										: "No verifications yet"}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-4">
							<div className="p-3 rounded-full bg-blue-500/10">
								<Calendar className="h-5 w-5 text-blue-500" />
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Last Verification</p>
								<p className="font-medium">
									{performanceData?.lastVerification
										? format(new Date(performanceData.lastVerification), "MMM d, yyyy 'at' h:mm a")
										: "No verifications yet"}
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default FieldWorkerPerformance;
