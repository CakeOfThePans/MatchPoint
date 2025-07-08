import prisma from '../../lib/prisma.js'

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
				status_type: 'finished',
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

export const updateMLResultsByLeague = async (leagueId) => {
	try {
		console.log('Updating ML results by league:', leagueId)

		let mLResults = await prisma.mLResultByLeague.findUnique({
			where: {
				league_id: leagueId,
			},
		})
		if (!mLResults) {
			await prisma.mLResultByLeague.create({
				data: {
					league_id: leagueId,
					correct_predictions: 0,
					incorrect_predictions: 0,
				},
			})
		}

		// Get all matches for the league
		let leagueMatches = await prisma.match.findMany({
			where: {
				league_id: leagueId,
				status_type: 'finished',
			},
		})

		// For each match, check if the winner prediction is correct
		let correctPredictions = 0
		let incorrectPredictions = 0

		for (let match of leagueMatches) {
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

		// Update the ML results for the league
		await prisma.mLResultByLeague.update({
			where: { league_id: leagueId },
			data: {
				correct_predictions: correctPredictions,
				incorrect_predictions: incorrectPredictions,
			},
		})
		console.log(
			`ML results for league ${leagueId} updated successfully: ${correctPredictions} correct, ${incorrectPredictions} incorrect`
		)
	} catch (error) {
		console.error('Error updating ML results by league:', error)
	}
}
