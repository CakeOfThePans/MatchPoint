import prisma from '../lib/prisma.js'

// Get all matches
const getAllMatches = async (req, res) => {
	try {
		const { page = 1, limit = 20, finishedOnly, search } = req.query
		const skip = (parseInt(page) - 1) * parseInt(limit)

		const whereClause = {}

		if (finishedOnly === 'true') {
			whereClause.status_type = 'Completed'
		} else {
			whereClause.start_time = {
				// Get matches greater than 6 hours ago
				gt: new Date(new Date().setHours(new Date().getHours() - 6)),
			}
		}

		// Add search functionality
		if (search && search.trim()) {
			const searchTerm = search.trim()
			whereClause.OR = [
				{
					home_team: {
						name: {
							contains: searchTerm,
							mode: 'insensitive',
						},
					},
				},
				{
					away_team: {
						name: {
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
				tournament: true,
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
				tournament: true,
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

// Get matches by tournament
const getMatchesByTournament = async (req, res) => {
	try {
		const { tournamentId } = req.params
		const { page = 1, limit = 20, finishedOnly, search } = req.query
		const skip = (parseInt(page) - 1) * parseInt(limit)

		const tournamentIdInt = parseInt(tournamentId)
		if (isNaN(tournamentIdInt)) {
			return res.status(400).json({
				success: false,
				error: 'Invalid tournament ID',
			})
		}

		const whereClause = {
			tournament_id: tournamentIdInt,
		}

		if (finishedOnly === 'true') {
			whereClause.status_type = 'Completed'
		} else {
			whereClause.start_time = {
				// Get matches greater than 6 hours ago
				gt: new Date(new Date().setHours(new Date().getHours() - 6)),
			}
		}

		// Add search functionality
		if (search && search.trim()) {
			const searchTerm = search.trim()
			whereClause.OR = [
				{
					home_team: {
						name: {
							contains: searchTerm,
							mode: 'insensitive',
						},
					},
				},
				{
					away_team: {
						name: {
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
				tournament: true,
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
		console.error('Error fetching matches by tournament:', error)
		res.status(500).json({
			success: false,
			error: 'Failed to fetch matches by tournament',
		})
	}
}

// Get matches by player
const getMatchesByPlayer = async (req, res) => {
	try {
		const { playerId } = req.params
		const { page = 1, limit = 20, finishedOnly } = req.query
		const skip = (parseInt(page) - 1) * parseInt(limit)

		const playerIdInt = parseInt(playerId)
		if (isNaN(playerIdInt)) {
			return res.status(400).json({
				success: false,
				error: 'Invalid player ID',
			})
		}

		const whereClause = {
			OR: [
				{
					home_team_id: playerIdInt,
				},
				{
					away_team_id: playerIdInt,
				},
			],
		}

		if (finishedOnly === 'true') {
			whereClause.status_type = 'Completed'
		} else {
			whereClause.start_time = {
				// Get matches greater than 6 hours ago
				gt: new Date(new Date().setHours(new Date().getHours() - 6)),
			}
			whereClause.status_type = {
				not: 'Completed',
			}
		}

		const matches = await prisma.match.findMany({
			where: whereClause,
			include: {
				tournament: true,
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
		console.error('Error fetching matches by player:', error)
		res.status(500).json({
			success: false,
			error: 'Failed to fetch matches by player',
		})
	}
}

export {
	getAllMatches,
	getMatchById,
	getMatchesByTournament,
	getMatchesByPlayer,
}
