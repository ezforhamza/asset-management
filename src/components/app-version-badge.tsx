import { useQuery } from "@tanstack/react-query";
import { UserRole } from "#/enum";
import appVersionService from "@/api/services/appVersionService";
import { useUserInfo } from "@/store/userStore";
import { StyledBadge } from "@/utils/badge-styles";

function compareVersions(v1: string, v2: string): number {
	const p1 = v1.split(".").map(Number);
	const p2 = v2.split(".").map(Number);
	for (let i = 0; i < 3; i++) {
		const diff = (p1[i] ?? 0) - (p2[i] ?? 0);
		if (diff !== 0) return diff;
	}
	return 0;
}

interface AppVersionBadgeProps {
	appVersion?: string | null;
	appPlatform?: string | null;
}

export function AppVersionBadge({ appVersion, appPlatform }: AppVersionBadgeProps) {
	const userInfo = useUserInfo();
	const isSystemAdmin = userInfo.role === UserRole.SYSTEM_ADMIN;

	const { data: configs } = useQuery({
		queryKey: ["app-version"],
		queryFn: appVersionService.getAll,
		staleTime: 5 * 60 * 1000,
		enabled: isSystemAdmin,
	});

	if (!appVersion) return <span className="text-muted-foreground text-sm">—</span>;

	const config = isSystemAdmin && appPlatform ? configs?.find((c) => c.platform === appPlatform) : undefined;

	if (!config) {
		return <span className="text-sm">{appVersion}</span>;
	}

	const isOutdated = compareVersions(appVersion, config.latestVersion) < 0;

	return <StyledBadge color={isOutdated ? "red" : "emerald"}>{appVersion}</StyledBadge>;
}
