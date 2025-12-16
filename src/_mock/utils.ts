// MSW delay utility - keep delays short to prevent timeout issues
// Set to 0 for instant responses, or small values like 100-200ms for realistic feel

export const MOCK_DELAY = {
	short: 100,
	medium: 200,
	long: 300,
};

// Helper to get delay based on environment
export const getDelay = (type: keyof typeof MOCK_DELAY = "short") => {
	// In development, use shorter delays to prevent timeouts
	return MOCK_DELAY[type];
};
