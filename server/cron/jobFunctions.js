import { updateLeaguesByDate, getLeaguesByDateRange } from './services/LeagueService.js'
import { getDateFromOffset, getDateRange } from './utils/dateUtils.js'
import { updateATPRankings } from './services/PlayerService.js'
import { updateMatchesByLeague, getMatchesByDateRange } from './services/MatchService.js'
import { updateOddsByMatch } from './services/OddsService.js'
import { updatePredictionsByMatch } from './services/PredictionService.js'
import { updateOverallMLResults, updateMLResultsByLeague } from './services/MLResultService.js'

const runDailyJobs = async () => {
	try {
    await updateATPRankings()
    await updateLeaguesByDate(getDateFromOffset(1)) // Update tomorrow's leagues
		await updateLeaguesByDate(new Date()) // Update today's leagues

    // Get all leagues that were tagged for today/tomorrow
    let dateRange = getDateRange(new Date(), 2)
    let leagues = await getLeaguesByDateRange(dateRange.start, dateRange.end)
    // Update matches for each league
    for (let league of leagues) {
      await updateMatchesByLeague(league.league_id, dateRange.start, dateRange.end)
    }

    // Get all matches that are happening today/tomorrow
    let matches = await getMatchesByDateRange(dateRange.start, dateRange.end)
    // Update odds for each match
    for (let match of matches) {
      await updateOddsByMatch(match.match_id)
    }

    // Get all matches that are happening today/tomorrow now that the odds are updated
    matches = await getMatchesByDateRange(dateRange.start, dateRange.end)
    // Update predictions for each match
    for (let match of matches) {
      await updatePredictionsByMatch(match)
    }

		console.log('Daily cron jobs completed successfully')
	} catch (error) {
		console.error('Error in daily cron jobs:', error)
	}
}

const runHourlyJobs = async () => {
	try {
		// Get all leagues that were tagged for today/tomorrow
    let dateRange = getDateRange(new Date(), 2)
    let leagues = await getLeaguesByDateRange(dateRange.start, dateRange.end)
    
    // Update matches for each league
    for (let league of leagues) {
      await updateMatchesByLeague(league.league_id, dateRange.start, dateRange.end)
    }

    // Get all matches that are happening today/tomorrow
    let matches = await getMatchesByDateRange(dateRange.start, dateRange.end)
    // Update predictions for each match
    for (let match of matches) {
      await updatePredictionsByMatch(match)
    }

    // Update ML results
    await updateOverallMLResults()
    for (let league of leagues) {
      await updateMLResultsByLeague(league.league_id)
    }

		console.log('Hourly cron jobs completed successfully')
	} catch (error) {
		console.error('Error in hourly cron jobs:', error)
	}
}

export { runDailyJobs, runHourlyJobs }