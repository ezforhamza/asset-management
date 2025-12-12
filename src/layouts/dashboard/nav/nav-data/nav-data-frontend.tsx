import { Icon } from "@/components/icon";
import type { NavProps } from "@/components/nav";

export const frontendNavData: NavProps["data"] = [
	// Main Navigation
	{
		name: "Main",
		items: [
			{
				title: "Dashboard",
				path: "/dashboard",
				icon: <Icon icon="solar:home-2-bold-duotone" size="24" />,
			},
			{
				title: "Reports",
				path: "/reports",
				icon: <Icon icon="solar:document-text-bold-duotone" size="24" />,
			},
			{
				title: "Map",
				path: "/map",
				icon: <Icon icon="solar:map-point-bold-duotone" size="24" />,
			},
		],
	},
	// Management
	{
		name: "Management",
		items: [
			{
				title: "Users",
				path: "/users",
				icon: <Icon icon="solar:users-group-rounded-bold-duotone" size="24" />,
			},
			{
				title: "Settings",
				path: "/settings",
				icon: <Icon icon="solar:settings-bold-duotone" size="24" />,
			},
		],
	},
];
