import "./global.css";
import "./theme/theme.css";
import "./locales/i18n";
import ReactDOM from "react-dom/client";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router";
import App from "./App";
import { registerLocalIcons } from "./components/icon";
import { GLOBAL_CONFIG } from "./global-config";
import ErrorBoundary from "./routes/components/error-boundary";
import { routesSection } from "./routes/sections";

await registerLocalIcons();

// Enable MSW if configured
if (import.meta.env.VITE_APP_ENABLE_MSW === "true") {
	const { worker } = await import("./_mock");
	const { startKeepalive } = await import("./_mock/keepalive");

	await worker.start({
		onUnhandledRequest: "bypass",
		serviceWorker: {
			url: "/mockServiceWorker.js",
			options: {
				scope: "/",
			},
		},
		quiet: false,
	});

	// Start keepalive to prevent service worker from becoming inactive
	startKeepalive(15000); // Ping every 15 seconds

	console.log("[MSW] Mock Service Worker started with keepalive");
}

const router = createBrowserRouter(
	[
		{
			Component: () => (
				<App>
					<Outlet />
				</App>
			),
			errorElement: <ErrorBoundary />,
			children: routesSection,
		},
	],
	{
		basename: GLOBAL_CONFIG.publicPath,
	},
);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<RouterProvider router={router} />);
