import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2, Plus, Save, X } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import companyService from "@/api/services/companyService";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Skeleton } from "@/ui/skeleton";
import { Switch } from "@/ui/switch";

interface NotificationSettingsForm {
	emailNotifications: boolean;
	overdueAlerts: boolean;
	repairAlerts: boolean;
	notificationEmails: { email: string }[];
}

export function NotificationSettings() {
	const queryClient = useQueryClient();

	const { data: settings, isLoading } = useQuery({
		queryKey: ["company", "settings"],
		queryFn: companyService.getSettings,
	});

	const form = useForm<NotificationSettingsForm>({
		defaultValues: {
			emailNotifications: true,
			overdueAlerts: true,
			repairAlerts: true,
			notificationEmails: [],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "notificationEmails",
	});

	// Update form when data loads
	useEffect(() => {
		if (settings?.repairNotificationEmails) {
			form.reset({
				emailNotifications: true,
				overdueAlerts: true,
				repairAlerts: true,
				notificationEmails: settings.repairNotificationEmails.map((email) => ({ email })),
			});
		}
	}, [settings, form]);

	const mutation = useMutation({
		mutationFn: (values: NotificationSettingsForm) => {
			return companyService.updateSettings({
				repairNotificationEmails: values.notificationEmails.map((e) => e.email).filter(Boolean),
			});
		},
		onSuccess: () => {
			toast.success("Notification settings saved");
			queryClient.invalidateQueries({ queryKey: ["company", "settings"] });
		},
		onError: () => {
			toast.error("Failed to save settings");
		},
	});

	const handleSubmit = (values: NotificationSettingsForm) => {
		mutation.mutate(values);
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-4 w-64 mt-2" />
				</CardHeader>
				<CardContent className="space-y-4">
					<Skeleton className="h-16 w-full" />
					<Skeleton className="h-16 w-full" />
					<Skeleton className="h-16 w-full" />
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
						<div className="flex items-center justify-between rounded-lg border p-4">
							<div className="space-y-0.5">
								<p className="font-medium">Email Notifications</p>
								<p className="text-sm text-muted-foreground">Enable email notifications for important events</p>
							</div>
							<Switch
								checked={form.watch("emailNotifications")}
								onCheckedChange={(checked) => form.setValue("emailNotifications", checked)}
							/>
						</div>

						<div className="flex items-center justify-between rounded-lg border p-4">
							<div className="space-y-0.5">
								<p className="font-medium">Overdue Alerts</p>
								<p className="text-sm text-muted-foreground">Get notified when assets become overdue</p>
							</div>
							<Switch
								checked={form.watch("overdueAlerts")}
								onCheckedChange={(checked) => form.setValue("overdueAlerts", checked)}
							/>
						</div>

						<div className="flex items-center justify-between rounded-lg border p-4">
							<div className="space-y-0.5">
								<p className="font-medium">Repair Alerts</p>
								<p className="text-sm text-muted-foreground">Get notified when assets need repair</p>
							</div>
							<Switch
								checked={form.watch("repairAlerts")}
								onCheckedChange={(checked) => form.setValue("repairAlerts", checked)}
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

					<Button type="submit" disabled={mutation.isPending}>
						{mutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
						Save Changes
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

export default NotificationSettings;
