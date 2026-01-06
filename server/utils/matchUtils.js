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

// gets age in years (decimal) between match date and birth date
export const getAge = (matchDate, birthDate) => {
  const age = (matchDate - birthDate) / (365.25 * 24 * 60 * 60 * 1000)
  return age
}

// formats play style to a number
export const formatPlayStyle = (playStyle) => {
  if (playStyle === "left") return 0
  if (playStyle === "right") return 1
  return 0
}