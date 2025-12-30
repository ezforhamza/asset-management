import { Bell, Building2, Clock, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

import { CompanyProfile } from "./components/CompanyProfile";
import { NotificationSettings } from "./components/NotificationSettings";
import { SecuritySettings } from "./components/SecuritySettings";
import { VerificationSettings } from "./components/VerificationSettings";

export default function SettingsPage() {
	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-card/50">
				<h1 className="text-xl font-semibold">Settings</h1>
				<p className="text-sm text-muted-foreground">Configure your organization and verification settings</p>
			</div>

			{/* Settings Tabs */}
			<Tabs defaultValue="company" className="flex-1 flex flex-col overflow-hidden">
				<div className="flex-shrink-0 px-6 py-4 border-b flex items-center justify-center">
					<TabsList className="grid w-full max-w-2xl grid-cols-4 h-11">
						<TabsTrigger value="company" className="gap-2">
							<Building2 className="h-4 w-4 hidden sm:block" />
							Company
						</TabsTrigger>
						<TabsTrigger value="verification" className="gap-2">
							<Clock className="h-4 w-4 hidden sm:block" />
							Verification
						</TabsTrigger>
						<TabsTrigger value="notifications" className="gap-2">
							<Bell className="h-4 w-4 hidden sm:block" />
							Notifications
						</TabsTrigger>
						<TabsTrigger value="security" className="gap-2">
							<Shield className="h-4 w-4 hidden sm:block" />
							Security
						</TabsTrigger>
					</TabsList>
				</div>

				<div className="flex-1 overflow-y-auto p-6">
					<div className="max-w-4xl mx-auto space-y-6">
						<TabsContent value="company" className="mt-0 space-y-6">
							<CompanyProfile />
						</TabsContent>

						<TabsContent value="verification" className="mt-0 space-y-6">
							<VerificationSettings />
						</TabsContent>

						<TabsContent value="notifications" className="mt-0 space-y-6">
							<NotificationSettings />
						</TabsContent>

						<TabsContent value="security" className="mt-0 space-y-6">
							<SecuritySettings />
						</TabsContent>
					</div>
				</div>
			</Tabs>
		</div>
	);
}
