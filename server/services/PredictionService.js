import prisma from '../lib/prisma.js'
import axios from 'axios'

export const updatePredictionsByMatch = async (match) => {
	try {
		console.log('Updating predictions by match:', match.match_id)

		// If the match is finished, we shouldn't update the predictions anymore unless there was no prediction yet
		if (match.status_type === 'finished' && match.winner_prediction_id) {
			console.log('Match is finished, skipping prediction update')
			return false
		}

		// If the match is canceled/interrupted/suspended, we shouldn't update the predictions
		if (
			match.status_type === 'canceled' ||
			match.status_type === 'interrupted' ||
			match.status_type === 'suspended'
		) {
			console.log(
				'Match is canceled/interrupted/suspended, skipping prediction update'
			)
			return false
		}

		// If the match doesn't have betting odds yet, we should skip
		if (!match.home_team_odds || !match.away_team_odds) {
			console.log('Match does not have betting odds, skipping prediction update')
			return false
		}

		let prediction = await getPredictionsByMatch(match)
		if (!prediction) {
			console.log('Unable to get predictions for match', match.match_id)
			return false
		}

		// Update the match with the predictions
		await prisma.match.update({
			where: { match_id: match.match_id },
			data: {
				home_team_prediction_prob: prediction.home_team_prediction_prob,
				away_team_prediction_prob: prediction.away_team_prediction_prob,
				winner_prediction_id:
					prediction.home_team_prediction_prob >
					prediction.away_team_prediction_prob
						? match.home_team_id
						: match.away_team_id,
			},
		})

		console.log('Updated prediction for match', match.match_id)
		return true
	} catch (error) {
		console.error('Error updating predictions by match:', error)
		return false
	}
}

const getPredictionsByMatch = async (match) => {
	try {
		// Convert surface type to numeric value for the ML model
		const surfaceMap = {
			Hard: 0,
			Clay: 1,
			Grass: 2,
		}
		// Hardcourt Indoor and Hardcourt Outdoor are both considered "Hardcourt" so it'll be 0
		const surfaceType = surfaceMap[match.ground_type] || 0

		// Check if we have complete player data for full model
		const hasCompleteData =
			match.home_team?.rank &&
			match.away_team?.rank &&
			match.home_team?.points &&
			match.away_team?.points &&
			match.home_team_odds &&
			match.away_team_odds

		let predictionResponse
		if (hasCompleteData) {
			// Use full model with all features
			const modelData = {
				surface: surfaceType,
				p1_rank: match.home_team.rank,
				p2_rank: match.away_team.rank,
				p1_points: match.home_team.points,
				p2_points: match.away_team.points,
				p1_b365_odds: match.home_team_odds,
				p2_b365_odds: match.away_team_odds,
			}

			const response = await axios.post(
				`${process.env.ML_API_URL}/predict`,
				modelData
			)
			predictionResponse = response.data
		} else if (match.home_team_odds && match.away_team_odds) {
			// Fallback to odds-only model if we have odds
			const modelData = {
				surface: surfaceType,
				p1_b365_odds: match.home_team_odds,
				p2_b365_odds: match.away_team_odds,
			}

			const response = await axios.post(
				`${process.env.ML_API_URL}/predict/odds-only`,
				modelData
			)
			predictionResponse = response.data
		} else {
			// If we don't even have odds, we can't make a prediction
			console.log(
				`Insufficient data for prediction for match ${match.match_id}`
			)
			return null
		}

		return {
			home_team_prediction_prob: predictionResponse.player1_win_probability,
			away_team_prediction_prob: predictionResponse.player2_win_probability,
		}
	} catch (error) {
		console.error('Error fetching predictions:', error)
		return null
	}
}
