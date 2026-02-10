import { useMutation, useQuery } from "@tanstack/react-query";
import { Clock, Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import companyService from "@/api/services/companyService";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Switch } from "@/ui/switch";

interface VerificationSettingsForm {
	verificationFrequency: number;
	geofenceThreshold: number;
	allowGPSOverride: boolean;
	dueSoonDays: number;
}

export function VerificationSettings() {
	const form = useForm<VerificationSettingsForm>({
		defaultValues: {
			verificationFrequency: 30,
			geofenceThreshold: 20,
			allowGPSOverride: true,
			dueSoonDays: 7,
		},
	});

	// Fetch actual company settings from API
	const { data: settings } = useQuery({
		queryKey: ["company-settings"],
		queryFn: companyService.getSettings,
	});

	// Update form with fetched settings
	useEffect(() => {
		if (settings) {
			form.reset({
				verificationFrequency: settings.verificationFrequency ?? 30,
				geofenceThreshold: settings.geofenceThreshold ?? 20,
				allowGPSOverride: settings.allowGPSOverride ?? true,
				dueSoonDays: settings.dueSoonDays ?? 7,
			});
		}
	}, [settings, form]);

	const mutation = useMutation({
		mutationFn: (values: VerificationSettingsForm) => {
			const { verificationFrequency, ...rest } = values;
			// updateSettings handles geofenceThreshold, allowGPSOverride, dueSoonDays
			// verificationFrequency needs to go through updateCompany endpoint
			const settingsPromise = companyService.updateSettings(rest);
			const freqPromise = companyService.updateCompanySettings({ verificationFrequency });
			return Promise.all([settingsPromise, freqPromise]);
		},
		onSuccess: () => {
			toast.success("Verification settings saved");
		},
		onError: () => {
			// Error toast is handled by apiClient;
		},
	});

	const handleSubmit = (values: VerificationSettingsForm) => {
		mutation.mutate(values);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Clock className="h-5 w-5" />
					Verification Settings
				</CardTitle>
				<CardDescription>Configure GPS requirements and verification settings</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					<div className="grid gap-6 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="verificationFrequency">Verification Frequency</Label>
							<div className="flex items-center gap-2">
								<Input
									id="verificationFrequency"
									type="number"
									min={1}
									max={365}
									{...form.register("verificationFrequency", { valueAsNumber: true })}
									className="w-24"
								/>
								<span className="text-sm text-muted-foreground">days</span>
							</div>
							<p className="text-xs text-muted-foreground">How often assets need to be verified</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="geofenceThreshold">GPS Geofence Threshold</Label>
							<div className="flex items-center gap-2">
								<Input
									id="geofenceThreshold"
									type="number"
									min={5}
									max={100}
									{...form.register("geofenceThreshold", { valueAsNumber: true })}
									className="w-24"
								/>
								<span className="text-sm text-muted-foreground">meters</span>
							</div>
							<p className="text-xs text-muted-foreground">Maximum distance for GPS verification to pass</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="dueSoonDays">"Due Soon" Warning Period</Label>
							<div className="flex items-center gap-2">
								<Input
									id="dueSoonDays"
									type="number"
									min={1}
									max={30}
									{...form.register("dueSoonDays", { valueAsNumber: true })}
									className="w-24"
								/>
								<span className="text-sm text-muted-foreground">days before due</span>
							</div>
							<p className="text-xs text-muted-foreground">When to show assets as "due soon"</p>
						</div>

						<div className="space-y-2">
							<Label>GPS Override</Label>
							<div className="flex items-center justify-between rounded-lg border p-4 bg-card">
								<div className="space-y-1 pr-4">
									<p className="text-sm font-medium leading-none">Allow GPS Override</p>
									<p className="text-xs text-muted-foreground">Let users skip GPS check after 3 retries</p>
								</div>
								<Switch
									checked={form.watch("allowGPSOverride")}
									onCheckedChange={(checked) => form.setValue("allowGPSOverride", checked)}
								/>
							</div>
						</div>
					</div>

					<Button type="submit" disabled={mutation.isPending}>
						{mutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
						Save Changes
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

export default VerificationSettings;
