// Date and Time Formatting

/**
 * Format a date string to a readable date format
 * @param {string} dateString - ISO date string
 * @param {object} options - Date formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
	if (!dateString) return '-'
	const date = new Date(dateString)
	const defaultOptions = {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		...options,
	}
	return date.toLocaleDateString('en-US', defaultOptions)
}

/**
 * Format a date string to a full date format (with weekday)
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string with weekday
 */
export const formatFullDate = (dateString) => {
	if (!dateString) return '-'
	const date = new Date(dateString)
	return date.toLocaleDateString('en-US', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})
}

/**
 * Format time from date string, flooring minutes to 5-minute intervals
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted time string (HH:MM)
 */
export const formatTime = (dateString) => {
	if (!dateString) return '-'
	const date = new Date(dateString)
	const minutes = date.getMinutes()
	const flooredMinutes = Math.floor(minutes / 5) * 5
	const flooredDate = new Date(date)
	flooredDate.setMinutes(flooredMinutes, 0, 0)
	return flooredDate.toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
	})
}

/**
 * Format match date and time, returning both date and time
 * @param {string} dateString - ISO date string
 * @returns {object} Object with date and time properties
 */
export const formatMatchDateTime = (dateString) => {
	if (!dateString) return { date: '-', time: '-' }
	const date = new Date(dateString)
	const formattedDate = date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	})
	const minutes = date.getMinutes()
	const flooredMinutes = Math.floor(minutes / 5) * 5
	const flooredDate = new Date(date)
	flooredDate.setMinutes(flooredMinutes, 0, 0)
	const formattedTime = flooredDate.toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
	})
	return { date: formattedDate, time: formattedTime }
}

/**
 * Group matches by date
 * @param {Array} matches - Array of match objects
 * @returns {Array} Array of grouped matches with date property
 */
export const groupMatchesByDate = (matches) => {
	const grouped = matches.reduce((acc, match) => {
		const date = new Date(match.start_time)
		const dateStr = date.toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		})
		const existingGroup = acc.find((group) => group.date === dateStr)
		if (existingGroup) {
			existingGroup.matches.push(match)
		} else {
			acc.push({
				date: dateStr,
				matches: [match],
			})
		}
		return acc
	}, [])

	return grouped
}

