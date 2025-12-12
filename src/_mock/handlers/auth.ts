import { http, HttpResponse, delay } from "msw";
import { MOCK_USERS, MOCK_CREDENTIALS } from "../data/users";

const generateToken = () => `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const authHandlers = [
	// Login
	http.post("/api/auth/login", async ({ request }) => {
		await delay(500);

		const body = (await request.json()) as { email: string; password: string };

		if (body.email === MOCK_CREDENTIALS.email && body.password === MOCK_CREDENTIALS.password) {
			const user = MOCK_USERS.find((u) => u.email === body.email);
			return HttpResponse.json({
				success: true,
				accessToken: generateToken(),
				refreshToken: generateToken(),
				user: user,
			});
		}

		return HttpResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
	}),

	// Refresh token
	http.post("/api/auth/refresh", async ({ request }) => {
		await delay(200);

		const body = (await request.json()) as { refreshToken: string };

		if (body.refreshToken) {
			return HttpResponse.json({
				success: true,
				accessToken: generateToken(),
			});
		}

		return HttpResponse.json({ success: false, error: "Invalid refresh token" }, { status: 401 });
	}),

	// Forgot password
	http.post("/api/auth/forgot-password", async ({ request }) => {
		await delay(800);

		const body = (await request.json()) as { email: string };

		if (body.email) {
			return HttpResponse.json({
				success: true,
				message: "Password reset link sent to email",
			});
		}

		return HttpResponse.json({ success: false, error: "Email is required" }, { status: 400 });
	}),

	// Reset password
	http.post("/api/auth/reset-password", async ({ request }) => {
		await delay(500);

		const body = (await request.json()) as { resetToken: string; newPassword: string };

		if (body.resetToken && body.newPassword) {
			return HttpResponse.json({
				success: true,
				message: "Password reset successfully",
			});
		}

		return HttpResponse.json({ success: false, error: "Invalid reset token" }, { status: 400 });
	}),

	// Change password
	http.post("/api/auth/change-password", async ({ request }) => {
		await delay(500);

		const body = (await request.json()) as { currentPassword: string; newPassword: string };

		if (body.currentPassword && body.newPassword) {
			return HttpResponse.json({
				success: true,
				message: "Password changed successfully",
			});
		}

		return HttpResponse.json({ success: false, error: "Current password is incorrect" }, { status: 400 });
	}),
];
