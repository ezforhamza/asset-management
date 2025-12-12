import { http, HttpResponse, delay } from "msw";
import { MOCK_USERS } from "../data/users";

export const userHandlers = [
	// Get all users
	http.get("/api/users", async ({ request }) => {
		await delay(400);

		const url = new URL(request.url);
		const role = url.searchParams.get("role");
		const status = url.searchParams.get("status");

		let users = [...MOCK_USERS];

		if (role) {
			users = users.filter((u) => u.role === role);
		}

		if (status) {
			users = users.filter((u) => (status === "active" ? u.status !== 0 : u.status === 0));
		}

		return HttpResponse.json(users);
	}),

	// Create field worker
	http.post("/api/users/create-field-worker", async ({ request }) => {
		await delay(600);

		const body = (await request.json()) as { name: string; email: string; role: string };

		const newUser = {
			id: `user_${Date.now()}`,
			...body,
			mustChangePassword: true,
		};

		return HttpResponse.json({
			success: true,
			userId: newUser.id,
			temporaryPassword: "TempPass123!",
			message: "User created. Invitation email sent.",
		});
	}),

	// Update user
	http.put("/api/users/:userId", async ({ params }) => {
		await delay(400);

		const { userId } = params;

		return HttpResponse.json({
			success: true,
			message: `User ${userId} updated successfully`,
		});
	}),

	// Deactivate user
	http.put("/api/users/:userId/deactivate", async ({ params }) => {
		await delay(400);

		const { userId } = params;

		return HttpResponse.json({
			success: true,
			message: `User ${userId} deactivated`,
		});
	}),

	// Reset user password
	http.post("/api/users/:userId/reset-password", async () => {
		await delay(500);

		return HttpResponse.json({
			success: true,
			temporaryPassword: "NewTemp456!",
			message: "Password reset. User will be prompted to change on next login.",
		});
	}),
];
