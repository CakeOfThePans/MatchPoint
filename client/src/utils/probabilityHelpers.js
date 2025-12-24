// Probability and Color Functions

/**
 * Format probability as percentage string
 * @param {number|null|undefined} prob - Probability value (0-1)
 * @returns {string} Formatted probability string (e.g., "75.5%")
 */
export const formatProbability = (prob) => {
	if (prob === null || prob === undefined) {
		return '?%'
	}
	return `${(prob * 100).toFixed(1)}%`
}

/**
 * Get Tailwind CSS classes for probability color based on percentage
 * @param {number|null|undefined} prob - Probability value (0-1)
 * @returns {string} Tailwind CSS classes for probability color
 */
export const getProbabilityColor = (prob) => {
	if (prob === null || prob === undefined) {
		return 'bg-gray-100 text-gray-700'
	}
	const percentage = prob * 100
	if (percentage >= 70) {
		return 'bg-green-100 text-green-800'
	} else if (percentage >= 50) {
		return 'bg-yellow-100 text-yellow-800'
	} else if (percentage >= 30) {
		return 'bg-orange-100 text-orange-800'
	} else {
		return 'bg-red-100 text-red-800'
	}
}

