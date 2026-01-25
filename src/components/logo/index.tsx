import { NavLink } from "react-router";
import { GLOBAL_CONFIG } from "@/global-config";
import { cn } from "@/utils";

interface Props {
	size?: number | string;
	className?: string;
	showTitle?: boolean;
	titleClassName?: string;
	withLink?: boolean;
}

function Logo({ size = 48, className, showTitle = false, titleClassName, withLink = true }: Props) {
	const sizeNum = typeof size === "string" ? parseInt(size, 10) : size;
	// Reduce logo size to ~50% of specified size since image was cropped larger
	const adjustedSize = Math.round(sizeNum * 0.5);

	const content = (
		<>
			<img
				src="/Asset Guard Favicon Logo BLACK and ORANGE Large.png"
				alt="Asset Guard"
				style={{ height: adjustedSize, width: "auto", minHeight: adjustedSize }}
				className="object-contain flex-shrink-0"
			/>
			{showTitle && (
				<span className={cn("text-xl font-bold whitespace-nowrap text-black dark:text-black", titleClassName)}>
					{GLOBAL_CONFIG.appName}
				</span>
			)}
		</>
	);

	if (withLink) {
		return (
			<NavLink to="/" className={cn("flex items-center gap-3", className)}>
				{content}
			</NavLink>
		);
	}

	return <div className={cn("flex items-center gap-3", className)}>{content}</div>;
}

export default Logo;
