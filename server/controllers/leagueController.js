import prisma from '../lib/prisma.js'

// Get all leagues
const getAllLeagues = async (req, res) => {
	try {
		const leagues = await prisma.league.findMany({
			orderBy: {
				last_checked: 'desc',
			},
		})

		res.status(200).json({
			success: true,
			data: leagues,
		})
	} catch (error) {
		console.error('Error fetching leagues:', error)
		res.status(500).json({
			success: false,
			error: 'Failed to fetch leagues',
		})
	}
}

// Get league by ID
const getLeagueById = async (req, res) => {
	try {
		const { id } = req.params
		const leagueId = parseInt(id)

		if (isNaN(leagueId)) {
			return res.status(400).json({
				success: false,
				error: 'Invalid league ID',
			})
		}

		const league = await prisma.league.findUnique({
			where: {
				league_id: leagueId,
			},
		})

		if (!league) {
			return res.status(404).json({
				success: false,
				error: 'League not found',
			})
		}

		res.status(200).json({
			success: true,
			data: league,
		})
	} catch (error) {
		console.error('Error fetching league:', error)
		res.status(500).json({
			success: false,
			error: 'Failed to fetch league',
		})
	}
}

export { getAllLeagues, getLeagueById }
