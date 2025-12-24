import prisma from '../lib/prisma.js'

// Get all tournaments
const getAllTournaments = async (req, res) => {
	try {
		const tournaments = await prisma.tournament.findMany({
			orderBy: {
				last_updated: 'desc',
			},
		})

		res.status(200).json({
			success: true,
			data: tournaments,
		})
	} catch (error) {
		console.error('Error fetching tournaments:', error)
		res.status(500).json({
			success: false,
			error: 'Failed to fetch tournaments',
		})
	}
}

// Get tournament by ID
const getTournamentById = async (req, res) => {
	try {
		const { id } = req.params
		const tournamentId = parseInt(id)

		if (isNaN(tournamentId)) {
			return res.status(400).json({
				success: false,
				error: 'Invalid tournament ID',
			})
		}

		const tournament = await prisma.tournament.findUnique({
			where: {
				tournament_id: tournamentId,
			},
		})

		if (!tournament) {
			return res.status(404).json({
				success: false,
				error: 'Tournament not found',
			})
		}

		res.status(200).json({
			success: true,
			data: tournament,
		})
	} catch (error) {
		console.error('Error fetching tournament:', error)
		res.status(500).json({
			success: false,
			error: 'Failed to fetch tournament',
		})
	}
}

export { getAllTournaments, getTournamentById }
