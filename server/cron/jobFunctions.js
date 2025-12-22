import { updateTournaments } from '../services/tournamentService.js'
import { updateMatchesFromTournament, updateLiveMatches } from '../services/MatchService.js'
import { updateRankings } from '../services/playerService.js'
import { updateOverallMLResults, updateMLResultsForRecentTournaments } from '../services/MLResultService.js'

// Get all tournaments, update matches for each tournament, update rankings
export const dailyJobs = async () => {
	try {
		await updateRankings()
		const tournaments = await updateTournaments()
		for (const tournament of tournaments) {
			await updateMatchesFromTournament(tournament)
		}
		await updateOverallMLResults()
		await updateMLResultsForRecentTournaments()
		console.log(`Daily jobs completed successfully`)
	} catch (error) {
		console.error(`Error running daily jobs:`, error)
	}
}

// Update live matches
export const hourlyJobs = async () => {
	try {
		await updateLiveMatches()
		await updateOverallMLResults()
		await updateMLResultsForRecentTournaments()
		console.log(`Hourly jobs completed successfully`)
	} catch (error) {
		console.error(`Error running hourly jobs:`, error)
	}
}

await hourlyJobs()