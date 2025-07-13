import prisma from '../lib/prisma.js'

// Get all matches
const getAllMatches = async (req, res) => {
	try {
		const { page = 1, limit = 20, finishedOnly, search } = req.query
		const skip = (parseInt(page) - 1) * parseInt(limit)

		const whereClause = {}

		if (finishedOnly === 'true') {
			whereClause.status_type = 'finished'
		} else {
			// Get matches that are finished, upcoming, or live AND start_time is after UTC midnight today
			whereClause.status_type = {
				in: ['finished', 'upcoming', 'live'],
			}
			whereClause.start_time = {
				gt: new Date(new Date().setHours(0, 0, 0, 0)),
			}
		}

		// Add search functionality
		if (search && search.trim()) {
			const searchTerm = search.trim()
			whereClause.OR = [
				{
					home_team: {
						team_name: {
							contains: searchTerm,
							mode: 'insensitive',
						},
					},
				},
				{
					away_team: {
						team_name: {
							contains: searchTerm,
							mode: 'insensitive',
						},
					},
				},
			]
		}

		const matches = await prisma.match.findMany({
			where: whereClause,
			include: {
				league: true,
				home_team: true,
				away_team: true,
				winner: true,
			},
			orderBy: {
				start_time: finishedOnly === 'true' ? 'desc' : 'asc',
			},
			skip,
			take: parseInt(limit),
		})

		const total = await prisma.match.count({ where: whereClause })

		res.status(200).json({
			success: true,
			data: matches,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / parseInt(limit)),
			},
		})
	} catch (error) {
		console.error('Error fetching matches:', error)
		res.status(500).json({
			success: false,
			error: 'Failed to fetch matches',
		})
	}
}

// Get match by ID
const getMatchById = async (req, res) => {
	try {
		const { id } = req.params
		const matchId = parseInt(id)

		if (isNaN(matchId)) {
			return res.status(400).json({
				success: false,
				error: 'Invalid match ID',
			})
		}

		const match = await prisma.match.findUnique({
			where: {
				match_id: matchId,
			},
			include: {
				league: true,
				home_team: true,
				away_team: true,
				winner: true,
			},
		})

		if (!match) {
			return res.status(404).json({
				success: false,
				error: 'Match not found',
			})
		}

		res.status(200).json({
			success: true,
			data: match,
		})
	} catch (error) {
		console.error('Error fetching match:', error)
		res.status(500).json({
			success: false,
			error: 'Failed to fetch match',
		})
	}
}

// Get matches by league
const getMatchesByLeague = async (req, res) => {
	try {
		const { leagueId } = req.params
		const { page = 1, limit = 20, finishedOnly, search } = req.query
		const skip = (parseInt(page) - 1) * parseInt(limit)

		const leagueIdInt = parseInt(leagueId)
		if (isNaN(leagueIdInt)) {
			return res.status(400).json({
				success: false,
				error: 'Invalid league ID',
			})
		}

		const whereClause = {
			league_id: leagueIdInt,
		}

		if (finishedOnly === 'true') {
			whereClause.status_type = 'finished'
		} else {
			// Get matches that are finished, upcoming, or live AND start_time is after UTC midnight today
			whereClause.status_type = {
				in: ['finished', 'upcoming', 'live'],
			}
			whereClause.start_time = {
				gt: new Date(new Date().setHours(0, 0, 0, 0)),
			}
		}

		// Add search functionality
		if (search && search.trim()) {
			const searchTerm = search.trim()
			whereClause.OR = [
				{
					home_team: {
						team_name: {
							contains: searchTerm,
							mode: 'insensitive',
						},
					},
				},
				{
					away_team: {
						team_name: {
							contains: searchTerm,
							mode: 'insensitive',
						},
					},
				},
			]
		}

		const matches = await prisma.match.findMany({
			where: whereClause,
			include: {
				league: true,
				home_team: true,
				away_team: true,
				winner: true,
			},
			orderBy: {
				start_time: finishedOnly === 'true' ? 'desc' : 'asc',
			},
			skip,
			take: parseInt(limit),
		})

		const total = await prisma.match.count({ where: whereClause })

		res.status(200).json({
			success: true,
			data: matches,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / parseInt(limit)),
			},
		})
	} catch (error) {
		console.error('Error fetching matches by league:', error)
		res.status(500).json({
			success: false,
			error: 'Failed to fetch matches by league',
		})
	}
}

export { getAllMatches, getMatchById, getMatchesByLeague }
