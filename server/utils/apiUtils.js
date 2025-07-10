import axios from 'axios'
import { API_CONFIG } from '../config/apiConfig.js'

// Helper function to build query string with duplicate keys (mainly for the matches endpoint since it has multiple start_time parameters)
const buildQueryString = (params) => {
	const searchParams = new URLSearchParams()

	Object.entries(params).forEach(([key, value]) => {
		if (Array.isArray(value)) {
			// Handle array of values for the same key
			value.forEach((v) => searchParams.append(key, v))
		} else {
			searchParams.append(key, value)
		}
	})

	return searchParams.toString()
}

// Generic function to handle paginated API calls
export const fetchPaginatedData = async (
	endpoint,
	params = {},
	apiKey = 'SPORTDEVS_API_KEY1'
) => {
	const allData = []
	let offset = 0
	let hasMore = true

	while (hasMore) {
		const queryParams = {
			...params,
			offset,
		}

		const config = {
			method: 'GET',
			url: `${API_CONFIG.SPORTDEVS_BASE_URL}${endpoint}?${buildQueryString(
				queryParams
			)}`,
			headers: {
				Authorization: process.env[apiKey],
			},
		}

		try {
			const response = await axios(config)
			allData.push(...response.data)

			offset += API_CONFIG.PAGINATION.DEFAULT_LIMIT
			hasMore = response.data.length === API_CONFIG.PAGINATION.DEFAULT_LIMIT
		} catch (error) {
			console.error(`Error fetching paginated data from ${endpoint}:`, error)
			throw error
		}
	}

	return allData
}

// Generic function to make a single API call
export const makeApiCall = async (
	endpoint,
	params = {},
	apiKey = 'SPORTDEVS_API_KEY1'
) => {
	const config = {
		method: 'GET',
		url: `${API_CONFIG.SPORTDEVS_BASE_URL}${endpoint}?${buildQueryString(
			params
		)}`,
		headers: {
			Authorization: process.env[apiKey],
		},
	}

	try {
		const response = await axios(config)
		return response.data
	} catch (error) {
		console.error(`Error making API call to ${endpoint}:`, error)
		throw error
	}
}

// Generic function to make a POST API call
export const makePostApiCall = async (url, data) => {
	try {
		const response = await axios.post(url, data)
		return response.data
	} catch (error) {
		console.error(`Error making POST API call to ${url}:`, error)
		throw error
	}
}
