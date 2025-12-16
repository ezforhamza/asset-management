import { Bell, Building2, Calendar, Clock, FileSpreadsheet, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

import { AssetImport } from "./components/AssetImport";
import { AssetManagement } from "./components/AssetManagement";
import { AssetTemplates } from "./components/AssetTemplates";
import { CompanyProfile } from "./components/CompanyProfile";
import { NotificationSettings } from "./components/NotificationSettings";
import { ScheduledReports } from "./components/ScheduledReports";
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
				<div className="flex-shrink-0 px-6 pt-4 border-b">
					<TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
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
						<TabsTrigger value="reports" className="gap-2">
							<Calendar className="h-4 w-4 hidden sm:block" />
							Reports
						</TabsTrigger>
						<TabsTrigger value="assets" className="gap-2">
							<FileSpreadsheet className="h-4 w-4 hidden sm:block" />
							Assets
						</TabsTrigger>
						<TabsTrigger value="security" className="gap-2">
							<Shield className="h-4 w-4 hidden sm:block" />
							Security
						</TabsTrigger>
					</TabsList>
				</div>

				<div className="flex-1 overflow-y-auto p-6">
					<TabsContent value="company" className="mt-0 space-y-6">
						<CompanyProfile />
					</TabsContent>

					<TabsContent value="verification" className="mt-0 space-y-6">
						<VerificationSettings />
					</TabsContent>

					<TabsContent value="notifications" className="mt-0 space-y-6">
						<NotificationSettings />
					</TabsContent>

					<TabsContent value="reports" className="mt-0 space-y-6">
						<ScheduledReports />
					</TabsContent>

					<TabsContent value="assets" className="mt-0 space-y-6">
						<AssetImport />
						<AssetTemplates />
						<AssetManagement />
					</TabsContent>

					<TabsContent value="security" className="mt-0 space-y-6">
						<SecuritySettings />
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}
