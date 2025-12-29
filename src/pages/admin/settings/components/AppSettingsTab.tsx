// @ts-nocheck
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Image, Loader2, MapPin, Save, WifiOff } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import adminService from "@/api/services/adminService";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Separator } from "@/ui/separator";
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

export function AppSettingsTab() {
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
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<div className="h-6 w-48 bg-muted animate-pulse rounded" />
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="h-20 bg-muted animate-pulse rounded" />
							<div className="h-20 bg-muted animate-pulse rounded" />
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
				{/* Save Button */}
				<div className="flex items-center justify-between p-4 rounded-lg border bg-card">
					<div>
						<h3 className="text-sm font-medium">Application Settings</h3>
						<p className="text-xs text-muted-foreground mt-1">
							Configure global settings for asset verification and management
						</p>
					</div>
					<Button type="submit" disabled={saveMutation.isPending} size="sm">
						{saveMutation.isPending ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Saving...
							</>
						) : (
							<>
								<Save className="h-4 w-4 mr-2" />
								Save Changes
							</>
						)}
					</Button>
				</div>

				{/* Verification Settings */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
								<Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							</div>
							<div>
								<CardTitle>Verification Settings</CardTitle>
								<CardDescription>Configure asset verification frequency and requirements</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<FormField
							control={form.control}
							name="defaultVerificationFrequency"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-start justify-between">
										<div className="space-y-1">
											<FormLabel>Default Verification Frequency</FormLabel>
											<FormDescription>How often assets should be verified (in days)</FormDescription>
										</div>
										<FormControl>
											<div className="flex items-center gap-2">
												<Input
													type="number"
													min={1}
													max={365}
													className="w-24"
													{...field}
													onChange={(e) => field.onChange(parseInt(e.target.value))}
												/>
												<span className="text-sm text-muted-foreground">days</span>
											</div>
										</FormControl>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Separator />

						<FormField
							control={form.control}
							name="allowOverride"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-start justify-between gap-4">
										<div className="space-y-1 flex-1">
											<FormLabel>Allow Company Override</FormLabel>
											<FormDescription>Let companies customize their own verification frequency</FormDescription>
										</div>
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
									</div>
								</FormItem>
							)}
						/>

						<Separator />

						<FormField
							control={form.control}
							name="requirePhotoOnVerification"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-start justify-between gap-4">
										<div className="space-y-1 flex-1">
											<FormLabel>Require Photo on Verification</FormLabel>
											<FormDescription>Field workers must upload photo when verifying assets</FormDescription>
										</div>
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
									</div>
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				{/* Location Settings */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
								<MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
							</div>
							<div>
								<CardTitle>Location Settings</CardTitle>
								<CardDescription>Configure geofencing and location accuracy</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<FormField
							control={form.control}
							name="geofenceThreshold"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-start justify-between">
										<div className="space-y-1 flex-1">
											<FormLabel>Geofence Threshold</FormLabel>
											<FormDescription>
												Maximum distance allowed between asset and verification location
											</FormDescription>
										</div>
										<FormControl>
											<Select value={String(field.value)} onValueChange={(v) => field.onChange(parseInt(v))}>
												<SelectTrigger className="w-[180px]">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="20">20m - Strict</SelectItem>
													<SelectItem value="50">50m - Standard</SelectItem>
													<SelectItem value="100">100m - Relaxed</SelectItem>
													<SelectItem value="200">200m - Very Relaxed</SelectItem>
												</SelectContent>
											</Select>
										</FormControl>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				{/* Image Storage */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
								<Image className="h-5 w-5 text-purple-600 dark:text-purple-400" />
							</div>
							<div>
								<CardTitle>Image Storage</CardTitle>
								<CardDescription>Manage photo retention and upload limits</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<FormField
							control={form.control}
							name="imageRetentionDays"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-start justify-between">
										<div className="space-y-1 flex-1">
											<FormLabel>Image Retention Period</FormLabel>
											<FormDescription>How long to keep verification photos in storage</FormDescription>
										</div>
										<FormControl>
											<Select value={String(field.value)} onValueChange={(v) => field.onChange(parseInt(v))}>
												<SelectTrigger className="w-[180px]">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="90">3 months</SelectItem>
													<SelectItem value="180">6 months</SelectItem>
													<SelectItem value="365">1 year</SelectItem>
													<SelectItem value="730">2 years</SelectItem>
													<SelectItem value="0">Keep Forever</SelectItem>
												</SelectContent>
											</Select>
										</FormControl>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Separator />

						<FormField
							control={form.control}
							name="maxImageSize"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-start justify-between">
										<div className="space-y-1 flex-1">
											<FormLabel>Maximum Image Size</FormLabel>
											<FormDescription>Maximum file size allowed for photo uploads</FormDescription>
										</div>
										<FormControl>
											<div className="flex items-center gap-2">
												<Input
													type="number"
													min={1}
													max={20}
													className="w-24"
													{...field}
													onChange={(e) => field.onChange(parseInt(e.target.value))}
												/>
												<span className="text-sm text-muted-foreground">MB</span>
											</div>
										</FormControl>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				{/* Offline Mode */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
								<WifiOff className="h-5 w-5 text-orange-600 dark:text-orange-400" />
							</div>
							<div>
								<CardTitle>Offline Mode</CardTitle>
								<CardDescription>Enable offline functionality for field workers</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<FormField
							control={form.control}
							name="enableOfflineMode"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-start justify-between gap-4">
										<div className="space-y-1 flex-1">
											<FormLabel>Enable Offline Mode</FormLabel>
											<FormDescription>
												Allow field workers to verify assets without internet connection
											</FormDescription>
										</div>
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
									</div>
								</FormItem>
							)}
						/>

						{form.watch("enableOfflineMode") && (
							<>
								<Separator />
								<FormField
									control={form.control}
									name="offlineSyncInterval"
									render={({ field }) => (
										<FormItem>
											<div className="flex items-start justify-between">
												<div className="space-y-1 flex-1">
													<FormLabel>Sync Interval</FormLabel>
													<FormDescription>How often to sync offline data when connection is restored</FormDescription>
												</div>
												<FormControl>
													<div className="flex items-center gap-2">
														<Input
															type="number"
															min={1}
															max={60}
															className="w-24"
															{...field}
															onChange={(e) => field.onChange(parseInt(e.target.value))}
														/>
														<span className="text-sm text-muted-foreground">min</span>
													</div>
												</FormControl>
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>
							</>
						)}
					</CardContent>
				</Card>
			</form>
		</Form>
	);
}
