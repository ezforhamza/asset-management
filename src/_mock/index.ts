import { setupWorker } from "msw/browser";
import { authHandlers } from "./handlers/auth";
import { dashboardHandlers } from "./handlers/dashboard";
import { userHandlers } from "./handlers/users";
import { reportHandlers } from "./handlers/reports";
import { assetHandlers } from "./handlers/assets";
import { companyHandlers } from "./handlers/company";
import { qrCodeHandlers } from "./handlers/qrCodes";
import { adminHandlers } from "./handlers/admin";

const handlers = [
	...authHandlers,
	...dashboardHandlers,
	...userHandlers,
	...reportHandlers,
	...assetHandlers,
	...companyHandlers,
	...qrCodeHandlers,
	...adminHandlers,
];

export const worker = setupWorker(...handlers);
