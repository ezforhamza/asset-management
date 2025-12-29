import { Key, Settings as SettingsIcon, User } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { PasswordTab } from "./components/PasswordTab";
import { ProfileTab } from "./components/ProfileTab";

export default function AdminSettingsPage() {
	const [activeTab, setActiveTab] = useState("profile");

	return (
		<div className="h-screen flex flex-col bg-background">
			{/* Header */}
			<div className="flex-shrink-0 border-b bg-card">
				<div className="px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
							<SettingsIcon className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
							<p className="text-sm text-muted-foreground mt-1">
								Manage your profile, security, and application settings
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
				<div className="px-6 py-6 pb-16">
					<div className="max-w-5xl mx-auto">
						<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="profile" className="flex items-center gap-2">
									<User className="h-4 w-4" />
									Profile
								</TabsTrigger>
								<TabsTrigger value="password" className="flex items-center gap-2">
									<Key className="h-4 w-4" />
									Password
								</TabsTrigger>
							</TabsList>

							<TabsContent value="profile" className="space-y-6">
								<ProfileTab />
							</TabsContent>

							<TabsContent value="password" className="space-y-6">
								<PasswordTab />
							</TabsContent>
						</Tabs>
					</div>
				</div>
			</div>
		</div>
	);
}
