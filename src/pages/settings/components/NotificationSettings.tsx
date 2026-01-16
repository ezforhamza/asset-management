import { useMutation } from "@tanstack/react-query";
import { Bell, Loader2, Plus, Save, X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import companyService from "@/api/services/companyService";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Switch } from "@/ui/switch";

interface NotificationSettingsForm {
	emailNotifications: boolean;
	overdueAlerts: boolean;
	repairAlerts: boolean;
	notificationEmails: { email: string }[];
}

export function NotificationSettings() {
	const form = useForm<NotificationSettingsForm>({
		defaultValues: {
			emailNotifications: true,
			overdueAlerts: true,
			repairAlerts: true,
			notificationEmails: [{ email: "" }],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "notificationEmails",
	});

	const mutation = useMutation({
		mutationFn: (values: NotificationSettingsForm) => {
			return companyService.updateSettings({
				repairNotificationEmails: values.notificationEmails.map((e) => e.email).filter(Boolean),
			});
		},
		onSuccess: () => {
			toast.success("Notification settings saved");
		},
		onError: () => {
			// Error toast is handled by apiClient;
		},
	});

	const handleSubmit = (values: NotificationSettingsForm) => {
		mutation.mutate(values);
	};

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
