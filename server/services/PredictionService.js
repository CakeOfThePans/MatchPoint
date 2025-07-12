import prisma from '../lib/prisma.js'
import axios from 'axios'
import { updateOddsByMatch } from './OddsService.js'

export const updatePredictionsByMatch = async (match) => {
	try {
		console.log('Updating predictions by match:', match.match_id)

		// If the match is finished, we shouldn't update the predictions anymore unless there was no prediction yet
		if (
			match.status_type === 'finished' &&
			match.winner_prediction_id &&
			match.prediction_model === 1 // We will allow updates only if we're upgrading from a lesser model (basically if we manually updated the database to add odds)
		) {
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

		// If the match doesn't have betting odds yet
		if (!match.home_team_odds || !match.away_team_odds) {
			console.log('Match does not have betting odds, updating odds')
			// Try to get the betting odds if we're within 12 hours of the match so we don't waste api calls
			if (
				match.start_time > new Date(Date.now() + 12 * 60 * 60 * 1000) ||
				match.start_time < new Date()
			) {
				console.log('Match is too far away, skipping odds update')
			} else {
				await updateOddsByMatch(match.match_id)
				match = await prisma.match.findUnique({
					// Refresh the match object
					where: { match_id: match.match_id },
					include: {
						home_team: true,
						away_team: true,
					},
				})
			}
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
				prediction_model: prediction.prediction_model,
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
		// Get ML API URL from environment variable
		const mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000'

		// Convert surface type to numeric value for the ML model
		const surfaceMap = {
			Hard: 0,
			Clay: 1,
			Grass: 2,
		}

		const surfaceType = surfaceMap[match.ground_type] || 0

		// Check if we have complete player data for full model
		const hasCompleteData =
			match.home_team?.rank &&
			match.away_team?.rank &&
			match.home_team?.points &&
			match.away_team?.points &&
			match.home_team_odds &&
			match.away_team_odds

		const hasOdds = match.home_team_odds && match.away_team_odds

		const hasRanks =
			match.home_team?.rank &&
			match.away_team?.rank &&
			match.home_team?.points &&
			match.away_team?.points

		let predictionResponse
		let model
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

			const response = await axios.post(`${mlApiUrl}/predict`, modelData)
			predictionResponse = response.data
			model = 1
		} else if (hasOdds) {
			// Fallback to odds-only model if we have odds
			const modelData = {
				surface: surfaceType,
				p1_b365_odds: match.home_team_odds,
				p2_b365_odds: match.away_team_odds,
			}

			const response = await axios.post(
				`${mlApiUrl}/predict/odds-only`,
				modelData
			)
			predictionResponse = response.data
			model = 2
		} else if (hasRanks) {
			// Use rank-only model if we have ranks
			const modelData = {
				surface: surfaceType,
				p1_rank: match.home_team.rank,
				p2_rank: match.away_team.rank,
				p1_points: match.home_team.points,
				p2_points: match.away_team.points,
			}

			const response = await axios.post(
				`${mlApiUrl}/predict/rank-only`,
				modelData
			)
			predictionResponse = response.data
			model = 3
		} else {
			// If we don't even have odds or ranks, we can't make a prediction
			console.log(
				`Insufficient data for prediction for match ${match.match_id}`
			)
			return null
		}

		return {
			home_team_prediction_prob: predictionResponse.player1_win_probability,
			away_team_prediction_prob: predictionResponse.player2_win_probability,
			prediction_model: model,
		}
	} catch (error) {
		console.error('Error fetching predictions:', error)
		return null
	}
}
