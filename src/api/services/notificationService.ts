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

export interface NotificationEmail {
	_id?: string;
	email: string;
	notificationTypes: string[];
	receiveAll: boolean;
}

export interface NotificationEmailsResponse {
	success: boolean;
	notificationEmails: NotificationEmail[];
	availableTypes: string[];
}

export interface NotificationEmailMutationResponse {
	success: boolean;
	message: string;
	notificationEmail: NotificationEmail;
}

export interface AddNotificationEmailPayload {
	email: string;
	notificationTypes?: string[];
	receiveAll?: boolean;
}

export interface UpdateNotificationEmailPayload {
	email: string;
	notificationTypes?: string[];
	receiveAll?: boolean;
}

export interface DeleteNotificationEmailPayload {
	email: string;
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
 * Get all notification email recipients for the company
 */
async function getNotificationEmails(): Promise<NotificationEmailsResponse> {
	const response = await apiClient.get<NotificationEmailsResponse>({ url: "/notifications/emails" });
	return response;
}

/**
 * Add a new notification email recipient
 */
async function addNotificationEmail(payload: AddNotificationEmailPayload): Promise<NotificationEmailMutationResponse> {
	const response = await apiClient.post<NotificationEmailMutationResponse>({
		url: "/notifications/emails",
		data: payload,
	});
	return response;
}

/**
 * Update an existing notification email recipient
 */
async function updateNotificationEmail(
	payload: UpdateNotificationEmailPayload,
): Promise<NotificationEmailMutationResponse> {
	const response = await apiClient.patch<NotificationEmailMutationResponse>({
		url: "/notifications/emails",
		data: payload,
	});
	return response;
}

/**
 * Delete a notification email recipient
 */
async function deleteNotificationEmail(payload: DeleteNotificationEmailPayload): Promise<void> {
	await apiClient.delete({ url: "/notifications/emails", data: payload });
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
	getNotificationEmails,
	addNotificationEmail,
	updateNotificationEmail,
	deleteNotificationEmail,
	requestRepair,
};

export default notificationService;
