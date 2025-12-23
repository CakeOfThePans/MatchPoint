import prisma from '../lib/prisma.js'

// Get player ranks (only players with rank and points)
const getPlayerRanks = async (req, res) => {
	try {
		const {
			page = 1,
			limit = 50,
			sortBy = 'rank',
			sortOrder = 'asc',
			search = '',
		} = req.query
		const skip = (parseInt(page) - 1) * parseInt(limit)

		// Build where clause for search and rank/points filter
		const whereClause = {
			AND: [
				// Only get players with rank and points
				{
					rank: {
						not: null,
					},
					points: {
						not: null,
					},
				},
				// Add search filter if provided
				search.trim()
					? {
							name: {
								contains: search.trim(),
								mode: 'insensitive', // Case-insensitive search
							},
					  }
					: {},
			],
		}

		const players = await prisma.player.findMany({
			where: whereClause,
			orderBy: {
				[sortBy]: sortOrder,
			},
			skip,
			take: parseInt(limit),
		})

		const total = await prisma.player.count({
			where: whereClause,
		})

		res.status(200).json({
			success: true,
			data: players,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / parseInt(limit)),
			},
		})
	} catch (error) {
		console.error('Error fetching player ranks:', error)
		res.status(500).json({
			success: false,
			error: 'Failed to fetch player ranks',
		})
	}
}

// Get player by ID
const getPlayerById = async (req, res) => {
	try {
		const { id } = req.params
		const playerId = parseInt(id)

		if (isNaN(playerId)) {
			return res.status(400).json({
				success: false,
				error: 'Invalid player ID',
			})
		}

		const player = await prisma.player.findUnique({
			where: {
				player_id: playerId,
			},
		})

		if (!player) {
			return res.status(404).json({
				success: false,
				error: 'Player not found',
			})
		}

		res.status(200).json({
			success: true,
			data: player,
		})
	} catch (error) {
		console.error('Error fetching player:', error)
		res.status(500).json({
			success: false,
			error: 'Failed to fetch player',
		})
	}
}

export { getPlayerRanks, getPlayerById }
