import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
	baseURL: '/api', // This will use the proxy configured in vite.config.js
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
})

// Response interceptor to automatically extract data
api.interceptors.response.use(
	(response) => {
		return response.data
	},
	(error) => {
		console.error('API Error:', error.response?.data || error.message)
		throw error
	}
)

// Match API functions
export const getMatches = async (
	finishedOnly = false,
	page = 1,
	limit = 12,
	search = ''
) => {
	const params = {
		page,
		limit,
	}
	if (finishedOnly) {
		params.finishedOnly = 'true'
	}
	if (search && search.trim()) {
		params.search = search.trim()
	}

	return api.get('/matches', { params })
}

export const getMatchById = async (id) => {
	return api.get(`/matches/${id}`)
}

export const getMatchesByLeague = async (
	leagueId,
	finishedOnly = false,
	page = 1,
	limit = 12,
	search = ''
) => {
	const params = {
		page,
		limit,
	}
	if (finishedOnly) {
		params.finishedOnly = 'true'
	}
	if (search && search.trim()) {
		params.search = search.trim()
	}

	return api.get(`/matches/league/${leagueId}`, { params })
}

// League API functions
export const getLeagues = async () => {
	return api.get('/leagues')
}

export const getLeagueById = async (id) => {
	return api.get(`/leagues/${id}`)
}

// Player API functions
export const getPlayerRanks = async (
	page = 1,
	limit = 20,
	sortBy = 'rank',
	sortOrder = 'asc',
	search = ''
) => {
	const params = {
		page,
		limit,
		sortBy,
		sortOrder,
	}
	if (search && search.trim()) {
		params.search = search.trim()
	}

	return api.get('/players', { params })
}

export const getPlayerById = async (id) => {
	return api.get(`/players/${id}`)
}

// ML Results API functions
export const getOverallMLResults = async () => {
	return api.get('/mlresults/overall')
}

export const getMLResultsByLeague = async () => {
	return api.get('/mlresults/leagues')
}

export const getMLResultsByGrandSlam = async () => {
	return api.get('/mlresults/grand-slam')
}

export const getMLResultsBySurface = async () => {
	return api.get('/mlresults/surface')
}
