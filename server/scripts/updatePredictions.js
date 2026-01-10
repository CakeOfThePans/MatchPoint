import prisma from '../lib/prisma.js'
import {
	getAge,
	formatPlayStyle,
} from '../utils/matchUtils.js'
import axios from 'axios'
import { updateOverallMLResults } from '../services/mlResultService.js'
import { updateMLResultsByTournament } from '../services/mlResultService.js'

const updateAllMatches = async () => {
	try {
    // clear all predictions
    console.log('Clearing all predictions...')
    await prisma.match.updateMany({
      data: {
        home_team_prediction_prob: null,
        away_team_prediction_prob: null,
        prediction_model: null,
        winner_prediction_id: null,
      },
    })
    console.log('Cleared all predictions')

    // get all matches
    console.log('Getting all matches...')
		const matches = await prisma.match.findMany({
			include: {
				home_team: true,
				away_team: true,
				winner: true,
				tournament: true,
			},
		})

		console.log(`Found ${matches.length} matches to update`)
		for (const match of matches) {
			await updateMatchPredictions(match)
		}
		console.log(`Updated ${matches.length} matches`)

    // Update ML Results
    await updateOverallMLResults()
    // Get all tournaments
    const tournaments = await prisma.tournament.findMany()
    for (const tournament of tournaments) {
      await updateMLResultsByTournament(tournament.tournament_id)
    }
    console.log(`Updated ML results for ${tournaments.length} tournaments`)
	} catch (error) {
		console.error('Error updating matches:', error)
		throw error
	}
}

/**
 * Upserts match information and associated players.
 * Uses scrapeMatch to get detailed match information.
 */
const updateMatchPredictions = async (match) => {
	try {
		const matchUpdateData = {}

		// Get predictions
		const predictions = await getPredictionsByMatch(match)
		if (predictions) {
			matchUpdateData.home_team_prediction_prob =
				predictions.home_team_prediction_prob
			matchUpdateData.away_team_prediction_prob =
				predictions.away_team_prediction_prob
			matchUpdateData.prediction_model = predictions.prediction_model
			matchUpdateData.winner_prediction_id =
				predictions.home_team_prediction_prob >
				predictions.away_team_prediction_prob
					? match.home_team_id
					: match.away_team_id
		}

		// Upsert match
		const upsertedMatch = await prisma.match.update({
			where: {
				match_id: parseInt(match.match_id),
			},
			data: {
				...matchUpdateData,
			},
		})

		console.log(`Updated match predictions for match ${match.match_id}`)
		return upsertedMatch
	} catch (error) {
		console.error(
			`Error updating match predictions for match ${match.match_id}:`,
			error
		)
		throw error
	}
}

const getPredictionsByMatch = async (match) => {
	try {
		// Get ML API URL from environment variable
		const mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000'

		const { home_team, away_team } = match

		// Check if we have complete player data for full model
		const hasPrimaryData =
			match.surface_type &&
			home_team.plays &&
			away_team.plays &&
			home_team.height &&
			away_team.height &&
			home_team.birth_date &&
			away_team.birth_date &&
			match.home_team_rank &&
			match.away_team_rank &&
			match.home_team_points &&
			match.away_team_points

		const hasSecondaryData =
			match.surface_type &&
			match.home_team_rank &&
			match.away_team_rank &&
			match.home_team_points &&
			match.away_team_points &&
			match.home_team_odds &&
			match.away_team_odds

		const hasTertiaryData =
			match.surface_type && match.home_team_odds && match.away_team_odds

		let predictionResponse
		let model
		if (hasPrimaryData) {
			// Use full model with all features
			const modelData = {
				surface: match.surface_type,
				p1_hand: formatPlayStyle(home_team.plays),
				p2_hand: formatPlayStyle(away_team.plays),
				p1_ht: home_team.height,
				p2_ht: away_team.height,
				p1_age: getAge(match.start_time, home_team.birth_date),
				p2_age: getAge(match.start_time, away_team.birth_date),
				p1_rank: match.home_team_rank,
				p2_rank: match.away_team_rank,
				p1_points: match.home_team_points,
				p2_points: match.away_team_points,
				p1_odds: match.home_team_odds,
				p2_odds: match.away_team_odds,
			}

			const response = await axios.post(
				`${mlApiUrl}/predict/primary`,
				modelData
			)
			predictionResponse = response.data
			model = 1
		} else if (hasSecondaryData) {
			// Use secondary model with rank, points, odds
			const modelData = {
				surface: match.surface_type,
				p1_rank: match.home_team_rank,
				p2_rank: match.away_team_rank,
				p1_points: match.home_team_points,
				p2_points: match.away_team_points,
				p1_odds: match.home_team_odds,
				p2_odds: match.away_team_odds,
			}

			const response = await axios.post(
				`${mlApiUrl}/predict/secondary`,
				modelData
			)
			predictionResponse = response.data
			model = 2
		} else if (hasTertiaryData) {
			// Use tertiary model with odds only
			const modelData = {
				surface: match.surface_type,
				p1_odds: match.home_team_odds,
				p2_odds: match.away_team_odds,
			}

			const response = await axios.post(
				`${mlApiUrl}/predict/tertiary`,
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

await updateAllMatches()