/**
 * Maps court type to ground type for the database.
 */
export const formatCourtType = (courtType) => {
	if (!courtType) return null;
	const lower = courtType.toLowerCase();
	if (lower.includes("hard")) return "Hard";
	if (lower.includes("clay")) return "Clay";
	if (lower.includes("grass")) return "Grass";
	if (lower.includes("indoor")) return "Hard"; // Indoor courts are considered hard courts
	return null;
};

/**
 * Determines status type based on match data.
 */
export const determineStatusType = (finalScore, datetime) => {
	if (finalScore) return "Completed";
	if (datetime && new Date(datetime) > new Date()) return "Scheduled";
	return "In Progress";
};

