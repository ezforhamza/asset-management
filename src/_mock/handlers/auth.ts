import { http, HttpResponse, delay } from "msw";
import { MOCK_USERS, MOCK_CREDENTIALS, MOCK_FIELD_USER_CREDENTIALS, MOCK_SYSADMIN_CREDENTIALS } from "../data/users";

const generateToken = () => `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const authHandlers = [
	// Login
	http.post("/api/auth/login", async ({ request }) => {
		await delay(150);

		const body = (await request.json()) as { email: string; password: string };

		// Check customer admin credentials
		if (body.email === MOCK_CREDENTIALS.email && body.password === MOCK_CREDENTIALS.password) {
			const user = MOCK_USERS.find((u) => u.email === body.email);
			return HttpResponse.json({
				success: true,
				accessToken: generateToken(),
				refreshToken: generateToken(),
				user: user,
			});
		}

		// Check field user credentials
		if (body.email === MOCK_FIELD_USER_CREDENTIALS.email && body.password === MOCK_FIELD_USER_CREDENTIALS.password) {
			const user = MOCK_USERS.find((u) => u.email === body.email);
			return HttpResponse.json({
				success: true,
				accessToken: generateToken(),
				refreshToken: generateToken(),
				user: user,
			});
		}

		// Check system admin credentials
		if (body.email === MOCK_SYSADMIN_CREDENTIALS.email && body.password === MOCK_SYSADMIN_CREDENTIALS.password) {
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
		await delay(50);

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
		await delay(150);

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
		await delay(150);

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
		await delay(150);

		const body = (await request.json()) as { currentPassword: string; newPassword: string };

		if (body.currentPassword && body.newPassword) {
			return HttpResponse.json({
				success: true,
				message: "Password changed successfully",
			});
		}

		return HttpResponse.json({ success: false, error: "Current password is incorrect" }, { status: 400 });
	}),

	// ============================================
	// MFA Handlers
	// ============================================

	// Get MFA status
	http.get("/api/users/mfa/status", async () => {
		await delay(100);

		return HttpResponse.json({
			enabled: false,
			passwordLastChanged: "2025-01-10",
		});
	}),

	// Setup MFA - generates QR code and secret
	http.post("/api/users/mfa/setup", async () => {
		await delay(200);

		const secret = "JBSWY3DPEHPK3PXP"; // Mock secret
		const backupCodes = [
			"A1B2-C3D4",
			"E5F6-G7H8",
			"I9J0-K1L2",
			"M3N4-O5P6",
			"Q7R8-S9T0",
			"U1V2-W3X4",
			"Y5Z6-A7B8",
			"C9D0-E1F2",
			"G3H4-I5J6",
			"K7L8-M9N0",
		];

		// Generate a mock QR code URL (in real app, this would be a data URL)
		const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/AssetGuard:user@example.com?secret=${secret}&issuer=AssetGuard`;

		return HttpResponse.json({
			qrCodeUrl,
			secret,
			backupCodes,
		});
	}),

	// Verify MFA code
	http.post("/api/users/mfa/verify", async ({ request }) => {
		await delay(100);

		const body = (await request.json()) as { code: string };

		// Accept any 6-digit code for mock
		if (body.code && body.code.length === 6) {
			return HttpResponse.json({ success: true });
		}

		return HttpResponse.json({ success: false, error: "Invalid code" }, { status: 400 });
	}),

	// Disable MFA
	http.delete("/api/users/mfa", async () => {
		await delay(100);

		return HttpResponse.json({ success: true });
	}),
];
