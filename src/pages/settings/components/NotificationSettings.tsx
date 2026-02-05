import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2, Plus, Save, X } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import companyService from "@/api/services/companyService";
import notificationService, { type NotificationPreferences } from "@/api/services/notificationService";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Switch } from "@/ui/switch";

interface NotificationSettingsForm {
	emailNotifications: boolean;
	overdueAlerts: boolean;
	repairAlerts: boolean;
	movementAlerts: boolean;
	notificationEmails: { email: string }[];
}

export function NotificationSettings() {
	const queryClient = useQueryClient();

	// Fetch current company settings to get existing emails
	const { data: companySettings, isLoading: isLoadingCompany } = useQuery({
		queryKey: ["company-settings"],
		queryFn: companyService.getSettings,
	});

	// Fetch notification preferences
	const { data: notificationPrefs, isLoading: isLoadingPrefs } = useQuery({
		queryKey: ["notification-preferences"],
		queryFn: notificationService.getNotificationPreferences,
	});

	const isLoading = isLoadingCompany || isLoadingPrefs;

	const form = useForm<NotificationSettingsForm>({
		defaultValues: {
			emailNotifications: true,
			overdueAlerts: true,
			repairAlerts: true,
			movementAlerts: true,
			notificationEmails: [],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "notificationEmails",
	});

	// Populate form with existing emails and preferences when data loads
	useEffect(() => {
		if (companySettings?.repairNotificationEmails) {
			const existingEmails = companySettings.repairNotificationEmails;
			if (existingEmails.length > 0) {
				form.setValue(
					"notificationEmails",
					existingEmails.map((email: string) => ({ email })),
				);
			} else {
				form.setValue("notificationEmails", [{ email: "" }]);
			}
		} else {
			form.setValue("notificationEmails", [{ email: "" }]);
		}
	}, [companySettings, form]);

	// Populate form with notification preferences
	useEffect(() => {
		if (notificationPrefs) {
			form.setValue("emailNotifications", notificationPrefs.emailNotificationsEnabled);
			form.setValue("overdueAlerts", notificationPrefs.overdueAlertsEnabled);
			form.setValue("repairAlerts", notificationPrefs.repairAlertsEnabled);
			form.setValue("movementAlerts", notificationPrefs.movementAlertsEnabled);
		}
	}, [notificationPrefs, form]);

	// Mutation to save notification emails
	const emailsMutation = useMutation({
		mutationFn: (emails: string[]) => {
			return companyService.updateSettings({
				repairNotificationEmails: emails,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["company-settings"] });
		},
		onError: () => {
			// Error toast is handled by apiClient;
		},
	});

	// Mutation to save notification preferences
	const prefsMutation = useMutation({
		mutationFn: (prefs: Partial<NotificationPreferences>) => {
			return notificationService.updateNotificationPreferences(prefs);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
		},
		onError: () => {
			// Error toast is handled by apiClient;
		},
	});

	const isSaving = emailsMutation.isPending || prefsMutation.isPending;

	const handleSubmit = async (values: NotificationSettingsForm) => {
		const emailsToSave = values.notificationEmails.map((e) => e.email).filter(Boolean);

		// Save both emails and preferences
		await Promise.all([
			emailsMutation.mutateAsync(emailsToSave),
			prefsMutation.mutateAsync({
				emailNotificationsEnabled: values.emailNotifications,
				overdueAlertsEnabled: values.overdueAlerts,
				repairAlertsEnabled: values.repairAlerts,
				movementAlertsEnabled: values.movementAlerts,
			}),
		]);

		toast.success("Notification settings saved");
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Bell className="h-5 w-5" />
						Notification Settings
					</CardTitle>
					<CardDescription>Configure email alerts and notification recipients</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Bell className="h-5 w-5" />
					Notification Settings
				</CardTitle>
				<CardDescription>Configure email alerts and notification recipients</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					{/* Toggle switches */}
					<div className="space-y-4">
						<div className="flex items-center justify-between rounded-lg border p-4 bg-card">
							<div className="space-y-1 pr-4">
								<p className="text-sm font-medium leading-none">Email Notifications</p>
								<p className="text-xs text-muted-foreground">Enable email notifications for important events</p>
							</div>
							<Switch
								checked={form.watch("emailNotifications")}
								onCheckedChange={(checked) => form.setValue("emailNotifications", checked)}
							/>
						</div>

						<div className="flex items-center justify-between rounded-lg border p-4 bg-card">
							<div className="space-y-1 pr-4">
								<p className="text-sm font-medium leading-none">Overdue Alerts</p>
								<p className="text-xs text-muted-foreground">Get notified when assets become overdue</p>
							</div>
							<Switch
								checked={form.watch("overdueAlerts")}
								onCheckedChange={(checked) => form.setValue("overdueAlerts", checked)}
							/>
						</div>

						<div className="flex items-center justify-between rounded-lg border p-4 bg-card">
							<div className="space-y-1 pr-4">
								<p className="text-sm font-medium leading-none">Repair Alerts</p>
								<p className="text-xs text-muted-foreground">Get notified when assets need repair</p>
							</div>
							<Switch
								checked={form.watch("repairAlerts")}
								onCheckedChange={(checked) => form.setValue("repairAlerts", checked)}
							/>
						</div>

						<div className="flex items-center justify-between rounded-lg border p-4 bg-card">
							<div className="space-y-1 pr-4">
								<p className="text-sm font-medium leading-none">Asset Movement Alerts</p>
								<p className="text-xs text-muted-foreground">Get notified when assets are moved</p>
							</div>
							<Switch
								checked={form.watch("movementAlerts")}
								onCheckedChange={(checked) => form.setValue("movementAlerts", checked)}
							/>
						</div>
					</div>

					{/* Notification emails */}
					<div className="space-y-3">
						<Label>Notification Recipients</Label>
						<p className="text-sm text-muted-foreground">Email addresses that will receive notifications</p>

						<div className="space-y-2">
							{fields.map((field, index) => (
								<div key={field.id} className="flex items-center gap-2">
									<Input
										type="email"
										placeholder="email@company.com"
										{...form.register(`notificationEmails.${index}.email`)}
										className="flex-1"
									/>
									{fields.length > 1 && (
										<Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
											<X className="h-4 w-4" />
										</Button>
									)}
								</div>
							))}
						</div>

						{fields.length < 5 && (
							<Button type="button" variant="outline" size="sm" onClick={() => append({ email: "" })}>
								<Plus className="h-4 w-4 mr-2" />
								Add Email
							</Button>
						)}
					</div>

					<Button type="submit" disabled={isSaving}>
						{isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
						Save Changes
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

export default NotificationSettings;
