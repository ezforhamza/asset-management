import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Image, Loader2, MapPin, Save, Settings } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import adminService from "@/api/services/adminService";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Switch } from "@/ui/switch";

interface GlobalSettingsForm {
	defaultVerificationFrequency: number;
	geofenceThreshold: number;
	allowOverride: boolean;
	imageRetentionDays: number;
	maxImageSize: number;
	requirePhotoOnVerification: boolean;
	enableOfflineMode: boolean;
	offlineSyncInterval: number;
}

export default function AdminSettingsPage() {
	const queryClient = useQueryClient();

	const { data: settings, isLoading } = useQuery({
		queryKey: ["admin", "global-settings"],
		queryFn: adminService.getGlobalSettings,
	});

	const form = useForm<GlobalSettingsForm>({
		defaultValues: {
			defaultVerificationFrequency: 30,
			geofenceThreshold: 50,
			allowOverride: true,
			imageRetentionDays: 365,
			maxImageSize: 5,
			requirePhotoOnVerification: true,
			enableOfflineMode: true,
			offlineSyncInterval: 5,
		},
	});

	useEffect(() => {
		if (settings) {
			form.reset(settings);
		}
	}, [settings, form]);

	const saveMutation = useMutation({
		mutationFn: adminService.updateGlobalSettings,
		onSuccess: () => {
			toast.success("Settings saved successfully");
			queryClient.invalidateQueries({ queryKey: ["admin", "global-settings"] });
		},
		onError: () => {
			toast.error("Failed to save settings");
		},
	});

	const handleSubmit = (values: GlobalSettingsForm) => {
		saveMutation.mutate(values);
	};

	if (isLoading) {
		return (
			<div className="h-full flex flex-col overflow-hidden">
				<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
					<Skeleton className="h-8 w-48" />
				</div>
				<div className="flex-1 p-6 space-y-6">
					<Skeleton className="h-48 w-full" />
					<Skeleton className="h-48 w-full" />
				</div>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
							<Settings className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h1 className="text-xl font-semibold">Global Settings</h1>
							<p className="text-sm text-muted-foreground">Configure system-wide defaults and policies</p>
						</div>
					</div>
					<Button onClick={form.handleSubmit(handleSubmit)} disabled={saveMutation.isPending}>
						{saveMutation.isPending ? (
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						) : (
							<Save className="h-4 w-4 mr-2" />
						)}
						Save Changes
					</Button>
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto p-6">
				<Form {...form}>
					<form className="space-y-6 max-w-3xl">
						{/* Verification Settings */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Clock className="h-5 w-5" />
									Verification Defaults
								</CardTitle>
								<CardDescription>Set default verification frequencies and policies</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<FormField
									control={form.control}
									name="defaultVerificationFrequency"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Default Verification Frequency (days)</FormLabel>
											<FormControl>
												<Input
													type="number"
													min={1}
													max={365}
													{...field}
													onChange={(e) => field.onChange(parseInt(e.target.value))}
												/>
											</FormControl>
											<FormDescription>Default number of days between required verifications</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="allowOverride"
									render={({ field }) => (
										<FormItem className="flex items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel className="text-base">Allow Customer Override</FormLabel>
												<FormDescription>Allow customers to set custom verification frequencies</FormDescription>
											</div>
											<FormControl>
												<Switch checked={field.value} onCheckedChange={field.onChange} />
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="requirePhotoOnVerification"
									render={({ field }) => (
										<FormItem className="flex items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel className="text-base">Require Photo</FormLabel>
												<FormDescription>Require photo evidence for all verifications</FormDescription>
											</div>
											<FormControl>
												<Switch checked={field.value} onCheckedChange={field.onChange} />
											</FormControl>
										</FormItem>
									)}
								/>
							</CardContent>
						</Card>

						{/* Geofence Settings */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<MapPin className="h-5 w-5" />
									Geofence Settings
								</CardTitle>
								<CardDescription>Configure location accuracy requirements</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<FormField
									control={form.control}
									name="geofenceThreshold"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Geofence Threshold (meters)</FormLabel>
											<Select value={String(field.value)} onValueChange={(v) => field.onChange(parseInt(v))}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select threshold" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="20">20 meters (High accuracy)</SelectItem>
													<SelectItem value="50">50 meters (Standard)</SelectItem>
													<SelectItem value="100">100 meters (Low accuracy)</SelectItem>
													<SelectItem value="200">200 meters (Very low)</SelectItem>
												</SelectContent>
											</Select>
											<FormDescription>Maximum distance from expected location for valid verification</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
						</Card>

						{/* Image Settings */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Image className="h-5 w-5" />
									Image Retention
								</CardTitle>
								<CardDescription>Configure image storage policies</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<FormField
									control={form.control}
									name="imageRetentionDays"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Image Retention Period (days)</FormLabel>
											<Select value={String(field.value)} onValueChange={(v) => field.onChange(parseInt(v))}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select period" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="90">90 days (3 months)</SelectItem>
													<SelectItem value="180">180 days (6 months)</SelectItem>
													<SelectItem value="365">365 days (1 year)</SelectItem>
													<SelectItem value="730">730 days (2 years)</SelectItem>
													<SelectItem value="0">Forever (no expiry)</SelectItem>
												</SelectContent>
											</Select>
											<FormDescription>How long to keep verification photos before archiving</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="maxImageSize"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Maximum Image Size (MB)</FormLabel>
											<FormControl>
												<Input
													type="number"
													min={1}
													max={20}
													{...field}
													onChange={(e) => field.onChange(parseInt(e.target.value))}
												/>
											</FormControl>
											<FormDescription>Maximum file size for uploaded verification photos</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
						</Card>

						{/* Offline Settings */}
						<Card>
							<CardHeader>
								<CardTitle>Offline Mode</CardTitle>
								<CardDescription>Configure offline sync behavior</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<FormField
									control={form.control}
									name="enableOfflineMode"
									render={({ field }) => (
										<FormItem className="flex items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel className="text-base">Enable Offline Mode</FormLabel>
												<FormDescription>Allow mobile app to work without internet</FormDescription>
											</div>
											<FormControl>
												<Switch checked={field.value} onCheckedChange={field.onChange} />
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="offlineSyncInterval"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Sync Interval (minutes)</FormLabel>
											<FormControl>
												<Input
													type="number"
													min={1}
													max={60}
													{...field}
													onChange={(e) => field.onChange(parseInt(e.target.value))}
												/>
											</FormControl>
											<FormDescription>How often the mobile app attempts to sync offline data</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
						</Card>
					</form>
				</Form>
			</div>
		</div>
	);
}
