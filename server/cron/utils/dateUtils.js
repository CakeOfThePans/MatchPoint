// Get the date in the format YYYY-MM-DD
export const getDate = (date) => {
	return date.toISOString().split('T')[0]
}

// Get the date range for the given date and number of extra days
export const getDateRange = (date, extraDays = 0) => {
	let start = new Date(date.setUTCHours(0, 0, 0, 0))
	let end = new Date(date.setUTCHours(23, 59, 59, 999))
	end.setDate(end.getDate() + extraDays)

	return {
		start: start,
		end: end,
	}
}

// Get date based on the number of days from today
export const getDateFromOffset = (days) => {
	return new Date(new Date().setDate(new Date().getDate() + days))
}