import { setupWorker } from "msw/browser";
import { authHandlers } from "./handlers/auth";
import { dashboardHandlers } from "./handlers/dashboard";
import { userHandlers } from "./handlers/users";
import { reportHandlers } from "./handlers/reports";
import { assetHandlers } from "./handlers/assets";

const handlers = [...authHandlers, ...dashboardHandlers, ...userHandlers, ...reportHandlers, ...assetHandlers];

export const worker = setupWorker(...handlers);
