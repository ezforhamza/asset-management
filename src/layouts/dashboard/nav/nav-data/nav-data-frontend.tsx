import { Icon } from "@/components/icon";
import type { NavProps } from "@/components/nav";

export const frontendNavData: NavProps["data"] = [
	// Dashboard section
	{
		name: "sys.nav.dashboard",
		items: [
			{
				title: "sys.nav.workbench",
				path: "/workbench",
				icon: <Icon icon="local:ic-workbench" size="24" />,
			},
			{
				title: "sys.nav.analysis",
				path: "/analysis",
				icon: <Icon icon="local:ic-analysis" size="24" />,
			},
		],
	},

	// Management section
	{
		name: "sys.nav.pages",
		items: [
			{
				title: "sys.nav.management",
				path: "/management",
				icon: <Icon icon="local:ic-management" size="24" />,
				children: [
					{
						title: "sys.nav.user.index",
						path: "/management/user",
						children: [
							{
								title: "sys.nav.user.profile",
								path: "/management/user/profile",
							},
							{
								title: "sys.nav.user.account",
								path: "/management/user/account",
							},
						],
					},
					{
						title: "sys.nav.system.index",
						path: "/management/system",
						children: [
							{
								title: "sys.nav.system.permission",
								path: "/management/system/permission",
							},
							{
								title: "sys.nav.system.role",
								path: "/management/system/role",
							},
							{
								title: "sys.nav.system.user",
								path: "/management/system/user",
							},
						],
					},
				],
			},

			// Error pages
			{
				title: "sys.nav.error.index",
				path: "/error",
				icon: <Icon icon="bxs:error-alt" size="24" />,
				children: [
					{
						title: "sys.nav.error.403",
						path: "/error/403",
					},
					{
						title: "sys.nav.error.404",
						path: "/error/404",
					},
					{
						title: "sys.nav.error.500",
						path: "/error/500",
					},
				],
			},
		],
	},

	// Permission demo (optional - can be removed if not needed)
	{
		name: "sys.nav.others",
		items: [
			{
				title: "sys.nav.permission",
				path: "/permission",
				icon: <Icon icon="mingcute:safe-lock-fill" size="24" />,
			},
			{
				title: "sys.nav.permission.page_test",
				path: "/permission/page-test",
				icon: <Icon icon="mingcute:safe-lock-fill" size="24" />,
				auth: ["permission:read"],
				hidden: true,
			},
		],
	},
];
