import { updateTournaments } from '../services/tournamentService.js'
import {
	updateMatchesFromTournament,
	updateLiveMatches,
} from '../services/matchService.js'
import { updateRankings } from '../services/playerService.js'
import {
	updateOverallMLResults,
	updateMLResultsForRecentTournaments,
} from '../services/mlResultService.js'

// Update rankings
export const updateRankingsJob = async () => {
	try {
		await updateRankings()
		console.log(`Rankings updated successfully`)
		return true
	} catch (error) {
		console.error(`Error updating rankings:`, error)
		return false
	}
}

// Get all tournaments, update matches for each tournament
export const updateTourJob = async () => {
	try {
		const tournaments = await updateTournaments()
		for (const tournament of tournaments) {
			await updateMatchesFromTournament(tournament)
		}
		await updateOverallMLResults()
		await updateMLResultsForRecentTournaments()
		console.log(`Daily jobs completed successfully`)
		return true
	} catch (error) {
		console.error(`Error running daily jobs:`, error)
		return false
	}
}

// Update live matches
export const updateLiveMatchesJob = async () => {
	try {
		await updateLiveMatches()
		await updateOverallMLResults()
		await updateMLResultsForRecentTournaments()
		console.log(`Hourly jobs completed successfully`)
		return true
	} catch (error) {
		console.error(`Error running hourly jobs:`, error)
		return false
	}
}
