import apiClient from "../apiClient";

// ==================== Types ====================

export interface NotificationPreferences {
	emailNotificationsEnabled: boolean;
	overdueAlertsEnabled: boolean;
	repairAlertsEnabled: boolean;
	movementAlertsEnabled: boolean;
}

export interface NotificationPreferencesResponse {
	success: boolean;
	notificationPreferences: NotificationPreferences;
}

export interface RequestRepairPayload {
	assetId: string;
	explanation?: string;
}

// ==================== API Functions ====================

/**
 * Get notification preferences for the company
 */
async function getNotificationPreferences(): Promise<NotificationPreferences> {
	const response = await apiClient.get<NotificationPreferencesResponse>({ url: "/notifications/preferences" });
	return response.notificationPreferences;
}

/**
 * Update notification preferences for the company
 */
async function updateNotificationPreferences(
	preferences: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
	const response = await apiClient.put<NotificationPreferencesResponse>({
		url: "/notifications/preferences",
		data: preferences,
	});
	return response.notificationPreferences;
}

/**
 * Request repair for an asset
 */
async function requestRepair(payload: RequestRepairPayload): Promise<void> {
	await apiClient.post({ url: "/notifications/request-repair", data: payload });
}

const notificationService = {
	getNotificationPreferences,
	updateNotificationPreferences,
	requestRepair,
};

export default notificationService;
