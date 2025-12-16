/**
 * MSW Keepalive Utility
 *
 * Service workers can become inactive after idle time, causing MSW to stop
 * intercepting requests. This utility implements multiple strategies to keep
 * the service worker alive and automatically recover if it becomes unresponsive.
 */

let keepaliveInterval: ReturnType<typeof setInterval> | null = null;
let isActive = false;

/**
 * Check if the service worker is still active and responsive
 */
async function checkServiceWorker(): Promise<boolean> {
	try {
		const registration = await navigator.serviceWorker.getRegistration("/");
		if (!registration || !registration.active) {
			console.warn("[MSW Keepalive] Service worker not found or not active");
			return false;
		}
		return true;
	} catch (error) {
		console.error("[MSW Keepalive] Error checking service worker:", error);
		return false;
	}
}

/**
 * Send a keepalive ping to the service worker
 */
async function sendKeepalive(): Promise<void> {
	try {
		const registration = await navigator.serviceWorker.getRegistration("/");
		if (registration?.active) {
			registration.active.postMessage("KEEPALIVE_REQUEST");
		}
	} catch (error) {
		console.error("[MSW Keepalive] Error sending keepalive:", error);
	}
}

/**
 * Attempt to recover the service worker if it becomes unresponsive
 */
async function recoverServiceWorker(): Promise<void> {
	console.log("[MSW Keepalive] Attempting to recover service worker...");

	try {
		// Try to get existing registration
		const registration = await navigator.serviceWorker.getRegistration("/");

		if (registration) {
			// Try to update the service worker
			await registration.update();
			console.log("[MSW Keepalive] Service worker updated");
		} else {
			// Re-register the service worker
			await navigator.serviceWorker.register("/mockServiceWorker.js", { scope: "/" });
			console.log("[MSW Keepalive] Service worker re-registered");
		}
	} catch (error) {
		console.error("[MSW Keepalive] Recovery failed:", error);
	}
}

/**
 * Handle visibility change - when tab becomes visible, check and recover SW
 */
function handleVisibilityChange(): void {
	if (document.visibilityState === "visible" && isActive) {
		console.log("[MSW Keepalive] Tab became visible, checking service worker...");
		checkServiceWorker().then((isAlive) => {
			if (!isAlive) {
				recoverServiceWorker();
			} else {
				sendKeepalive();
			}
		});
	}
}

/**
 * Handle online/offline events
 */
function handleOnline(): void {
	if (isActive) {
		console.log("[MSW Keepalive] Back online, checking service worker...");
		checkServiceWorker().then((isAlive) => {
			if (!isAlive) {
				recoverServiceWorker();
			}
		});
	}
}

/**
 * Start the keepalive mechanism
 * @param intervalMs - How often to send keepalive pings (default: 20 seconds)
 */
export function startKeepalive(intervalMs = 20000): void {
	if (isActive) {
		console.log("[MSW Keepalive] Already running");
		return;
	}

	isActive = true;
	console.log(`[MSW Keepalive] Starting with ${intervalMs}ms interval`);

	// Send keepalive pings at regular intervals
	keepaliveInterval = setInterval(() => {
		sendKeepalive();
	}, intervalMs);

	// Listen for visibility changes (tab focus/blur)
	document.addEventListener("visibilitychange", handleVisibilityChange);

	// Listen for online/offline events
	window.addEventListener("online", handleOnline);

	// Listen for service worker state changes
	navigator.serviceWorker.addEventListener("controllerchange", () => {
		console.log("[MSW Keepalive] Controller changed, service worker updated");
	});

	// Initial keepalive
	sendKeepalive();
}

/**
 * Stop the keepalive mechanism
 */
export function stopKeepalive(): void {
	if (!isActive) return;

	isActive = false;
	console.log("[MSW Keepalive] Stopping");

	if (keepaliveInterval) {
		clearInterval(keepaliveInterval);
		keepaliveInterval = null;
	}

	document.removeEventListener("visibilitychange", handleVisibilityChange);
	window.removeEventListener("online", handleOnline);
}

/**
 * Force a service worker check and recovery if needed
 */
export async function forceCheck(): Promise<boolean> {
	const isAlive = await checkServiceWorker();
	if (!isAlive) {
		await recoverServiceWorker();
		return false;
	}
	return true;
}
