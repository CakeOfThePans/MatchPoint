import prisma from '../lib/prisma.js'

export const updateOverallMLResults = async () => {
	try {
		console.log('Updating overall ML results...')

		let overallMLResults = await prisma.mLResultOverall.findUnique({
			where: {
				id: 1,
			},
		})

		// If the overall ML results don't exist, create them
		if (!overallMLResults) {
			await prisma.mLResultOverall.create({
				data: {
					correct_predictions: 0,
					incorrect_predictions: 0,
				},
			})
		}

		// Gather all matches that have finished
		let finishedMatches = await prisma.match.findMany({
			where: {
				status_type: 'Completed',
			},
		})

		// For each match, check if the winner prediction is correct
		let correctPredictions = 0
		let incorrectPredictions = 0

		for (let match of finishedMatches) {
			// If the match doesn't have a winner prediction or winner, we shouldn't count it
			if (!match.winner_prediction_id || !match.winner_id) {
				continue
			}

			if (match.winner_prediction_id === match.winner_id) {
				correctPredictions++
			} else {
				incorrectPredictions++
			}
		}

		// Update the overall ML results
		await prisma.mLResultOverall.update({
			where: { id: 1 },
			data: {
				correct_predictions: correctPredictions,
				incorrect_predictions: incorrectPredictions,
			},
		})
		console.log(
			`Overall ML results updated successfully: ${correctPredictions} correct, ${incorrectPredictions} incorrect`
		)
	} catch (error) {
		console.error('Error updating overall ML results:', error)
	}
}

export const updateMLResultsByTournament = async (tournamentId) => {
	try {
		console.log('Updating ML results by tournament:', tournamentId)

		let mLResults = await prisma.mLResultByTournament.findUnique({
			where: {
				tournament_id: tournamentId,
			},
		})
		if (!mLResults) {
			await prisma.mLResultByTournament.create({
				data: {
					tournament_id: tournamentId,
					correct_predictions: 0,
					incorrect_predictions: 0,
				},
			})
		}

		// Get all matches for the tournament
		let tournamentMatches = await prisma.match.findMany({
			where: {
				tournament_id: tournamentId,
				status_type: 'Completed',
			},
		})

		// For each match, check if the winner prediction is correct
		let correctPredictions = 0
		let incorrectPredictions = 0

		for (let match of tournamentMatches) {
			// If the match doesn't have a winner prediction or winner, we shouldn't count it
			if (!match.winner_prediction_id || !match.winner_id) {
				continue
			}

			if (match.winner_prediction_id === match.winner_id) {
				correctPredictions++
			} else {
				incorrectPredictions++
			}
		}

		// Update the ML results for the tournament
		await prisma.mLResultByTournament.update({
			where: { tournament_id: tournamentId },
			data: {
				correct_predictions: correctPredictions,
				incorrect_predictions: incorrectPredictions,
			},
		})
		console.log(
			`ML results for tournament ${tournamentId} updated successfully: ${correctPredictions} correct, ${incorrectPredictions} incorrect`
		)
	} catch (error) {
		console.error('Error updating ML results by tournament:', error)
	}
}

// Update ML results for tournaments updated within 24 hours
export const updateMLResultsForRecentTournaments = async () => {
	try {
		const now = new Date()
		const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago

		// Get tournaments that were last updated within 24 hours
		const recentTournaments = await prisma.tournament.findMany({
			where: {
				last_updated: {
					gte: twentyFourHoursAgo, // last_updated >= 24 hours ago
					lte: now, // last_updated <= now
				},
			},
			select: {
				tournament_id: true,
				tournament_name: true,
			},
		})

		console.log(
			`Found ${recentTournaments.length} tournaments updated within 24 hours`
		)

		// Update ML results for each tournament
		for (const tournament of recentTournaments) {
			await updateMLResultsByTournament(tournament.tournament_id)
		}

		console.log(
			`Updated ML results for ${recentTournaments.length} tournaments`
		)
	} catch (error) {
		console.error(`Error updating ML results for recent tournaments:`, error)
		throw error
	}
}