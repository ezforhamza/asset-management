import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, Save, Smartphone } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import appVersionService, { type AppPlatform, type AppVersionConfig } from "@/api/services/appVersionService";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Switch } from "@/ui/switch";
import { Textarea } from "@/ui/textarea";

const PLATFORMS: { key: AppPlatform; label: string }[] = [
	{ key: "android", label: "Android" },
	{ key: "ios", label: "iOS" },
	{ key: "huawei", label: "Huawei" },
];

const platformSchema = z.object({
	latestVersion: z.string().regex(/^\d+\.\d+\.\d+$/, "Format must be MAJOR.MINOR.PATCH (e.g. 1.2.0)"),
	storeUrl: z.string().url("Must be a valid URL"),
	forceUpdateMessage: z.string().max(300, "Max 300 characters").optional(),
	isActive: z.boolean(),
});

type PlatformForm = z.infer<typeof platformSchema>;

function PlatformCard({
	platform,
	config,
}: {
	platform: { key: AppPlatform; label: string };
	config?: AppVersionConfig;
}) {
	const queryClient = useQueryClient();

	const form = useForm<PlatformForm>({
		resolver: zodResolver(platformSchema),
		defaultValues: {
			latestVersion: config?.latestVersion ?? "",
			storeUrl: config?.storeUrl ?? "",
			forceUpdateMessage: config?.forceUpdateMessage ?? "",
			isActive: config?.isActive ?? true,
		},
	});

	useEffect(() => {
		if (config) {
			form.reset({
				latestVersion: config.latestVersion,
				storeUrl: config.storeUrl,
				forceUpdateMessage: config.forceUpdateMessage ?? "",
				isActive: config.isActive,
			});
		}
	}, [config, form]);

	const { mutate, isPending } = useMutation({
		mutationFn: (data: PlatformForm) => appVersionService.updatePlatform(platform.key, data),
		onSuccess: () => {
			toast.success(`${platform.label} version config saved`);
			queryClient.invalidateQueries({ queryKey: ["app-version"] });
		},
	});

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2 text-base">
						<Smartphone className="h-4 w-4 text-primary" />
						{platform.label}
					</CardTitle>
					{config?.updatedAt && (
						<span className="text-xs text-muted-foreground">
							Last updated: {format(new Date(config.updatedAt), "MMM d, yyyy")}
						</span>
					)}
				</div>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit((d) => mutate(d))} className="space-y-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="latestVersion"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Latest Version</FormLabel>
										<FormControl>
											<Input placeholder="1.2.0" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="storeUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Store URL</FormLabel>
										<FormControl>
											<Input placeholder="https://..." {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name="forceUpdateMessage"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Force Update Message</FormLabel>
									<FormControl>
										<Textarea
											placeholder="A new version is available. Please update to continue."
											className="resize-none"
											rows={2}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex items-center justify-between">
							<FormField
								control={form.control}
								name="isActive"
								render={({ field }) => (
									<FormItem className="flex items-center gap-3 space-y-0">
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
										<FormLabel className="font-normal">Force Update Active</FormLabel>
									</FormItem>
								)}
							/>
							<Button type="submit" size="sm" disabled={isPending}>
								{isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
								Save
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}

export function AppVersionTab() {
	const { data: configs, isLoading } = useQuery({
		queryKey: ["app-version"],
		queryFn: appVersionService.getAll,
	});

	const getConfig = (platform: AppPlatform) => configs?.find((c) => c.platform === platform);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-6 w-6 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div>
				<h3 className="text-base font-semibold">App Version Management</h3>
				<p className="text-sm text-muted-foreground mt-1">
					Set the latest version per platform. Mobile users on older versions will be blocked until they update.
				</p>
			</div>
			<div className="grid grid-cols-1 gap-4">
				{PLATFORMS.map((p) => (
					<PlatformCard key={p.key} platform={p} config={getConfig(p.key)} />
				))}
			</div>
		</div>
	);
}
