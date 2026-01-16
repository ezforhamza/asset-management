import { VerificationStatus } from "#/enum";
import { StyledBadge } from "@/utils/badge-styles";

interface StatusBadgeProps {
	status: VerificationStatus | string | undefined | null;
	className?: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
	switch (status) {
		case VerificationStatus.ON_TIME:
		case "on_time":
			return <StyledBadge color="emerald">On Time</StyledBadge>;
		case VerificationStatus.DUE_SOON:
		case "due_soon":
			return <StyledBadge color="orange">Due Soon</StyledBadge>;
		case VerificationStatus.OVERDUE:
		case "overdue":
			return <StyledBadge color="red">Overdue</StyledBadge>;
		default:
			return <StyledBadge color="gray">Unknown</StyledBadge>;
	}
}

export default StatusBadge;
