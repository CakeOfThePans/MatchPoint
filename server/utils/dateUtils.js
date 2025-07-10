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

// Get the date range for the given start and end dates
export const getDateRangeFromDates = (startDate, endDate) => {
	let start = new Date(startDate.setUTCHours(0, 0, 0, 0))
	let end = new Date(endDate.setUTCHours(23, 59, 59, 999))

	// If the start date is after the end date throw an error
	if (start > end) {
		throw new Error('Start date cannot be after end date')
	}

	return {
		start: start,
		end: end,
	}
}

// Get date based on the number of days from today
export const getDateFromOffset = (days) => {
	return new Date(new Date().setDate(new Date().getDate() + days))
}