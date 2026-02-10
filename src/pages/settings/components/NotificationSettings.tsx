import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2, Mail, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import notificationService, {
	type NotificationEmail,
	type NotificationPreferences,
} from "@/api/services/notificationService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Checkbox } from "@/ui/checkbox";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Switch } from "@/ui/switch";

const TYPE_LABELS: Record<string, { label: string; description: string }> = {
	repair: { label: "Repair", description: "Asset repair, poor condition, GPS failure alerts" },
	movement: { label: "Movement", description: "Asset movement requested/started/completed" },
	overdue: { label: "Overdue", description: "Overdue verification & due-soon reminders" },
};

export function NotificationSettings() {
	const queryClient = useQueryClient();

	// ── State for add/edit form ──
	const [showForm, setShowForm] = useState(false);
	const [editingEmail, setEditingEmail] = useState<string | null>(null);
	const [formEmail, setFormEmail] = useState("");
	const [formReceiveAll, setFormReceiveAll] = useState(false);
	const [formTypes, setFormTypes] = useState<string[]>([]);

	// ── Preferences state ──
	const [prefsForm, setPrefsForm] = useState<NotificationPreferences>({
		emailNotificationsEnabled: true,
		overdueAlertsEnabled: true,
		repairAlertsEnabled: true,
		movementAlertsEnabled: true,
	});
	const [prefsDirty, setPrefsDirty] = useState(false);

	// ── Queries ──
	const { data: notificationPrefs, isLoading: isLoadingPrefs } = useQuery({
		queryKey: ["notification-preferences"],
		queryFn: notificationService.getNotificationPreferences,
	});

	const { data: emailsData, isLoading: isLoadingEmails } = useQuery({
		queryKey: ["notification-emails"],
		queryFn: notificationService.getNotificationEmails,
	});

	const isLoading = isLoadingPrefs || isLoadingEmails;
	const emails = emailsData?.notificationEmails ?? [];
	const availableTypes = emailsData?.availableTypes ?? ["repair", "movement", "overdue"];

	// Sync prefs from server
	useEffect(() => {
		if (notificationPrefs) {
			setPrefsForm(notificationPrefs);
			setPrefsDirty(false);
		}
	}, [notificationPrefs]);

	// ── Mutations ──
	const prefsMutation = useMutation({
		mutationFn: (prefs: Partial<NotificationPreferences>) => notificationService.updateNotificationPreferences(prefs),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
			toast.success("Notification preferences saved");
			setPrefsDirty(false);
		},
	});

	const addMutation = useMutation({
		mutationFn: notificationService.addNotificationEmail,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notification-emails"] });
			toast.success("Notification email added");
			resetForm();
		},
	});

	const updateMutation = useMutation({
		mutationFn: notificationService.updateNotificationEmail,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notification-emails"] });
			toast.success("Notification email updated");
			resetForm();
		},
	});

	const deleteMutation = useMutation({
		mutationFn: notificationService.deleteNotificationEmail,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notification-emails"] });
			toast.success("Notification email removed");
		},
	});

	// ── Helpers ──
	const resetForm = () => {
		setShowForm(false);
		setEditingEmail(null);
		setFormEmail("");
		setFormReceiveAll(false);
		setFormTypes([]);
	};

	const openAddForm = () => {
		resetForm();
		setShowForm(true);
	};

	const openEditForm = (entry: NotificationEmail) => {
		setEditingEmail(entry.email);
		setFormEmail(entry.email);
		setFormReceiveAll(entry.receiveAll);
		setFormTypes(entry.receiveAll ? [] : [...entry.notificationTypes]);
		setShowForm(true);
	};

	const toggleType = (type: string) => {
		setFormTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
	};

	const handlePrefsChange = (key: keyof NotificationPreferences, value: boolean) => {
		setPrefsForm((prev) => ({ ...prev, [key]: value }));
		setPrefsDirty(true);
	};

	const handleSavePrefs = () => {
		prefsMutation.mutate(prefsForm);
	};

	const handleSubmitEmail = () => {
		const trimmedEmail = formEmail.trim();
		if (!trimmedEmail) {
			toast.error("Please enter an email address");
			return;
		}

		if (!formReceiveAll && formTypes.length === 0) {
			toast.error("Select at least one notification type or enable 'Receive All'");
			return;
		}

		const payload = {
			email: trimmedEmail,
			notificationTypes: formReceiveAll ? [] : formTypes,
			receiveAll: formReceiveAll,
		};

		if (editingEmail) {
			updateMutation.mutate(payload);
		} else {
			addMutation.mutate(payload);
		}
	};

	const isMutating = addMutation.isPending || updateMutation.isPending;

	// ── Render ──
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
		<div className="space-y-6">
			{/* ── Master Preference Switches ── */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Bell className="h-5 w-5" />
						Notification Preferences
					</CardTitle>
					<CardDescription>Master switches to enable or disable notification categories</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between rounded-lg border p-4 bg-card">
						<div className="space-y-1 pr-4">
							<p className="text-sm font-medium leading-none">Email Notifications</p>
							<p className="text-xs text-muted-foreground">Enable email notifications for important events</p>
						</div>
						<Switch
							checked={prefsForm.emailNotificationsEnabled}
							onCheckedChange={(v) => handlePrefsChange("emailNotificationsEnabled", v)}
						/>
					</div>
					<div className="flex items-center justify-between rounded-lg border p-4 bg-card">
						<div className="space-y-1 pr-4">
							<p className="text-sm font-medium leading-none">Overdue Alerts</p>
							<p className="text-xs text-muted-foreground">Get notified when assets become overdue</p>
						</div>
						<Switch
							checked={prefsForm.overdueAlertsEnabled}
							onCheckedChange={(v) => handlePrefsChange("overdueAlertsEnabled", v)}
						/>
					</div>
					<div className="flex items-center justify-between rounded-lg border p-4 bg-card">
						<div className="space-y-1 pr-4">
							<p className="text-sm font-medium leading-none">Repair Alerts</p>
							<p className="text-xs text-muted-foreground">Get notified when assets need repair</p>
						</div>
						<Switch
							checked={prefsForm.repairAlertsEnabled}
							onCheckedChange={(v) => handlePrefsChange("repairAlertsEnabled", v)}
						/>
					</div>
					<div className="flex items-center justify-between rounded-lg border p-4 bg-card">
						<div className="space-y-1 pr-4">
							<p className="text-sm font-medium leading-none">Asset Movement Alerts</p>
							<p className="text-xs text-muted-foreground">Get notified when assets are moved</p>
						</div>
						<Switch
							checked={prefsForm.movementAlertsEnabled}
							onCheckedChange={(v) => handlePrefsChange("movementAlertsEnabled", v)}
						/>
					</div>

					{prefsDirty && (
						<Button onClick={handleSavePrefs} disabled={prefsMutation.isPending} size="sm">
							{prefsMutation.isPending ? (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							) : (
								<Save className="h-4 w-4 mr-2" />
							)}
							Save Preferences
						</Button>
					)}
				</CardContent>
			</Card>

			{/* ── Email Recipients ── */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<Mail className="h-5 w-5" />
								Notification Recipients
							</CardTitle>
							<CardDescription>Manage email addresses and their notification subscriptions</CardDescription>
						</div>
						{!showForm && (
							<Button size="sm" onClick={openAddForm}>
								<Plus className="h-4 w-4 mr-2" />
								Add Recipient
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Add / Edit form */}
					{showForm && (
						<div className="rounded-lg border p-4 space-y-4 bg-muted/30">
							<div className="flex items-center justify-between">
								<Label className="text-sm font-medium">{editingEmail ? "Edit Recipient" : "New Recipient"}</Label>
								<Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={resetForm}>
									<X className="h-4 w-4" />
								</Button>
							</div>

							<Input
								type="email"
								placeholder="email@company.com"
								value={formEmail}
								onChange={(e) => setFormEmail(e.target.value)}
								disabled={!!editingEmail}
							/>

							{/* Receive All toggle */}
							<div className="flex items-center gap-3">
								<Switch checked={formReceiveAll} onCheckedChange={setFormReceiveAll} />
								<div>
									<p className="text-sm font-medium">Receive All</p>
									<p className="text-xs text-muted-foreground">
										Receive all notification types regardless of selection
									</p>
								</div>
							</div>

							{/* Type checkboxes — only shown when receiveAll is false */}
							{!formReceiveAll && (
								<div className="space-y-2">
									<Label className="text-xs text-muted-foreground">Notification Types</Label>
									{availableTypes.map((type) => (
										<button
											key={type}
											type="button"
											className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50 transition-colors w-full text-left"
											onClick={() => toggleType(type)}
										>
											<Checkbox
												checked={formTypes.includes(type)}
												onCheckedChange={() => toggleType(type)}
												onClick={(e) => e.stopPropagation()}
											/>
											<div>
												<p className="text-sm font-medium capitalize">{TYPE_LABELS[type]?.label ?? type}</p>
												<p className="text-xs text-muted-foreground">{TYPE_LABELS[type]?.description ?? ""}</p>
											</div>
										</button>
									))}
								</div>
							)}

							<div className="flex gap-2">
								<Button size="sm" onClick={handleSubmitEmail} disabled={isMutating}>
									{isMutating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
									{editingEmail ? "Update" : "Add"}
								</Button>
								<Button size="sm" variant="outline" onClick={resetForm} disabled={isMutating}>
									Cancel
								</Button>
							</div>
						</div>
					)}

					{/* Email list */}
					{emails.length === 0 && !showForm ? (
						<p className="text-sm text-muted-foreground text-center py-6">No notification recipients configured yet.</p>
					) : (
						<div className="space-y-2">
							{emails.map((entry) => (
								<div
									key={entry._id ?? entry.email}
									className="flex items-center justify-between rounded-lg border p-3 bg-card"
								>
									<div className="space-y-1.5 min-w-0 flex-1">
										<p className="text-sm font-medium truncate">{entry.email}</p>
										<div className="flex flex-wrap gap-1.5">
											{entry.receiveAll ? (
												<Badge variant="default">All Types</Badge>
											) : (
												entry.notificationTypes.map((t) => (
													<Badge key={t} variant="outline" className="capitalize">
														{TYPE_LABELS[t]?.label ?? t}
													</Badge>
												))
											)}
											{!entry.receiveAll && entry.notificationTypes.length === 0 && (
												<Badge variant="warning">No types</Badge>
											)}
										</div>
									</div>
									<div className="flex items-center gap-1 ml-2 shrink-0">
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="h-8 w-8"
											onClick={() => openEditForm(entry)}
										>
											<Pencil className="h-3.5 w-3.5" />
										</Button>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-destructive hover:text-destructive"
											onClick={() => deleteMutation.mutate({ email: entry.email })}
											disabled={deleteMutation.isPending}
										>
											<Trash2 className="h-3.5 w-3.5" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export default NotificationSettings;
