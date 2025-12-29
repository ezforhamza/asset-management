import { UserRole } from "#/enum";
import { Icon } from "@/components/icon";
import type { NavProps } from "@/components/nav";

// Client Panel Navigation (Customer Admin & Field User)
export const clientNavData: NavProps["data"] = [
	{
		name: "Main",
		items: [
			{
				title: "Dashboard",
				path: "/dashboard",
				icon: <Icon icon="solar:home-2-bold-duotone" size="24" />,
				roles: [UserRole.FIELD_USER, UserRole.CUSTOMER_ADMIN],
			},
			{
				title: "Assets",
				path: "/assets",
				icon: <Icon icon="solar:box-bold-duotone" size="24" />,
				roles: [UserRole.FIELD_USER, UserRole.CUSTOMER_ADMIN],
			},
			{
				title: "Reports",
				path: "/reports",
				icon: <Icon icon="solar:document-text-bold-duotone" size="24" />,
				roles: [UserRole.FIELD_USER, UserRole.CUSTOMER_ADMIN],
			},
			{
				title: "Map",
				path: "/map",
				icon: <Icon icon="solar:map-point-bold-duotone" size="24" />,
				roles: [UserRole.FIELD_USER, UserRole.CUSTOMER_ADMIN],
			},
		],
	},
	{
		name: "Management",
		items: [
			{
				title: "Users",
				path: "/users",
				icon: <Icon icon="solar:users-group-rounded-bold-duotone" size="24" />,
				roles: [UserRole.CUSTOMER_ADMIN],
			},
			{
				title: "Settings",
				path: "/settings",
				icon: <Icon icon="solar:settings-bold-duotone" size="24" />,
				roles: [UserRole.CUSTOMER_ADMIN],
			},
		],
	},
];

// Admin Panel Navigation (System Admin only)
export const adminNavData: NavProps["data"] = [
	{
		name: "Overview",
		items: [
			{
				title: "Dashboard",
				path: "/admin/dashboard",
				icon: <Icon icon="solar:home-2-bold-duotone" size="24" />,
				roles: [UserRole.SYSTEM_ADMIN],
			},
		],
	},
	{
		name: "Administration",
		items: [
			{
				title: "Companies",
				path: "/admin/companies",
				icon: <Icon icon="solar:buildings-bold-duotone" size="24" />,
				roles: [UserRole.SYSTEM_ADMIN],
			},
			{
				title: "QR Inventory",
				path: "/admin/qr-inventory",
				icon: <Icon icon="solar:qr-code-bold-duotone" size="24" />,
				roles: [UserRole.SYSTEM_ADMIN],
			},
		],
	},
	{
		name: "System",
		items: [
			{
				title: "Audit Logs",
				path: "/admin/audit-logs",
				icon: <Icon icon="solar:clipboard-list-bold-duotone" size="24" />,
				roles: [UserRole.SYSTEM_ADMIN],
			},
			{
				title: "Settings",
				path: "/admin/settings",
				icon: <Icon icon="solar:settings-bold-duotone" size="24" />,
				roles: [UserRole.SYSTEM_ADMIN],
			},
		],
	},
];

// Legacy export for compatibility
export const frontendNavData = clientNavData;
