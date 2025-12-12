import { NavLink } from "react-router";
import { cn } from "@/utils";

interface Props {
	size?: number | string;
	className?: string;
}

function Logo({ size = 40, className }: Props) {
	const sizeNum = typeof size === "string" ? parseInt(size, 10) : size;

	return (
		<NavLink to="/" className={cn("flex items-center gap-2", className)}>
			<img
				src="/Asset Guard Favicon Logo BLACK and ORANGE Large.png"
				alt="Asset Guard"
				style={{ height: sizeNum, width: sizeNum }}
				className="object-contain"
			/>
		</NavLink>
	);
}

export default Logo;
