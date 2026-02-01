import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { Progress } from "@/ui/progress";

export function RouteLoadingProgress() {
	const [progress, setProgress] = useState(0);
	const location = useLocation();
	const isFirstRender = useRef(true);

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally only trigger on pathname changes
	useEffect(() => {
		// Skip animation on first render to avoid infinite loop
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		setProgress(0);
		let currentProgress = 0;

		const interval = setInterval(() => {
			currentProgress += 2;
			setProgress(currentProgress);
		}, 5);

		const timer = setTimeout(() => {
			clearInterval(interval);
			setProgress(100);
			setTimeout(() => setProgress(0), 100);
		}, 500);

		return () => {
			clearInterval(interval);
			clearTimeout(timer);
		};
	}, [location.pathname]);

	return progress > 0 ? (
		<div className="fixed top-0 left-0 right-0 z-tooltip w-screen">
			<Progress value={progress} className="h-[3px] shadow-2xl" />
		</div>
	) : null;
}
