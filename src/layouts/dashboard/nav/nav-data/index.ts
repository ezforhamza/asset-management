import type { NavItemDataProps } from "@/components/nav/types";
import { GLOBAL_CONFIG } from "@/global-config";
import { useUserInfo } from "@/store/userStore";
import { UserRole } from "#/enum";
import { useMemo } from "react";
import { backendNavData } from "./nav-data-backend";
import { clientNavData, adminNavData } from "./nav-data-frontend";

/**
 * Get nav data based on user role
 * - System Admin sees admin panel navigation
 * - Customer Admin / Field User sees client panel navigation
 */
const getNavDataForRole = (userRole: string | undefined) => {
	if (GLOBAL_CONFIG.routerMode === "backend") {
		return backendNavData;
	}

	// System admin gets admin panel navigation
	if (userRole === UserRole.SYSTEM_ADMIN) {
		return adminNavData;
	}

	// Customer admin and field user get client panel navigation
	return clientNavData;
};

/**
 * Filter nav items based on user role
 */
const filterItemsByRole = (items: NavItemDataProps[], userRole: string | undefined): NavItemDataProps[] => {
	return items
		.filter((item) => {
			if (!item.roles || item.roles.length === 0) return true;
			if (!userRole) return false;
			return item.roles.includes(userRole);
		})
		.map((item) => {
			if (item.children?.length) {
				return { ...item, children: filterItemsByRole(item.children, userRole) };
			}
			return item;
		});
};

/**
 * Filter navigation data based on user role
 */
const filterNavDataByRole = (userRole: string | undefined) => {
	const navData = getNavDataForRole(userRole);
	return navData
		.map((group) => {
			const filteredItems = filterItemsByRole(group.items, userRole);
			if (filteredItems.length === 0) return null;
			return { ...group, items: filteredItems };
		})
		.filter((group): group is NonNullable<typeof group> => group !== null);
};

/**
 * Hook to get filtered navigation data based on user role
 */
export const useFilteredNavData = () => {
	const userInfo = useUserInfo();
	const filteredNavData = useMemo(() => filterNavDataByRole(userInfo.role), [userInfo.role]);
	return filteredNavData;
};
