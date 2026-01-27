/**
 * Utility function to format raw API values for display in the UI.
 * Converts snake_case to Title Case and handles common formatting patterns.
 */

/**
 * Converts a snake_case or raw string to a human-readable Title Case label.
 * Examples:
 *   - "on_time" -> "On Time"
 *   - "due_soon" -> "Due Soon"
 *   - "needs_repair" -> "Needs Repair"
 *   - "non_operational" -> "Non Operational"
 *   - "customer_admin" -> "Customer Admin"
 *
 * @param value - The raw string value to format
 * @returns A formatted, human-readable string
 */
export function formatLabel(value: string | undefined | null): string {
	if (!value) return "—";

	return value
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}

/**
 * Capitalizes the first letter of a string.
 * Example: "verified" -> "Verified"
 */
export function capitalize(value: string | undefined | null): string {
	if (!value) return "—";
	return value.charAt(0).toUpperCase() + value.slice(1);
}

export default formatLabel;
