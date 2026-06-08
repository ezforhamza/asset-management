import type { ReactNode } from "react";
import { useSettings } from "@/store/settingStore";
import { cn } from "@/utils";
import AccountDropdown from "../components/account-dropdown";
import BreadCrumb from "../components/bread-crumb";
import SettingButton from "../components/setting-button";

interface HeaderProps {
	leftSlot?: ReactNode;
}

export default function Header({ leftSlot }: HeaderProps) {
	const { breadCrumb } = useSettings();
	return (
		<header
			data-slot="slash-layout-header"
			className={cn(
				"sticky top-0 left-0 right-0 z-app-bar",
				"flex items-center justify-between px-4 grow-0 shrink-0",
				"bg-background/80 backdrop-blur-xl border-b",
				"h-[var(--layout-header-height)]",
			)}
		>
			<div className="flex items-center">
				{leftSlot}
				<div className="hidden md:block ml-4">{breadCrumb && <BreadCrumb />}</div>
			</div>

			<div className="flex items-center gap-2">
				<SettingButton />
				<AccountDropdown />
			</div>
		</header>
	);
}
