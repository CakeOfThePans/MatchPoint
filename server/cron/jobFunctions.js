import {
	updateLeaguesByDate,
	getLeaguesByDateRange,
} from '../services/LeagueService.js'
import { getDateFromOffset, getDateRange } from '../utils/dateUtils.js'
import { updateATPRankings } from '../services/PlayerService.js'
import {
	updateMatchesByLeague,
	getMatchesByDateRange,
} from '../services/MatchService.js'
import { updateOddsByMatch } from '../services/OddsService.js'
import { updatePredictionsByMatch } from '../services/PredictionService.js'
import {
	updateOverallMLResults,
	updateMLResultsByLeague,
} from '../services/MLResultService.js'
import prisma from '../lib/prisma.js'

// Update the last daily run date
const updateLastDailyRun = async () => {
	await prisma.mLResultOverall.upsert({
		where: { id: 1 },
		update: { last_daily_run: new Date() },
		create: {
			id: 1,
			correct_predictions: 0,
			incorrect_predictions: 0,
			last_daily_run: new Date(),
		},
	})
}

const runDailyJobs = async () => {
	try {
		await updateATPRankings()
		await updateLeaguesByDate(new Date()) // Update today's leagues
		await updateLeaguesByDate(getDateFromOffset(1)) // Update tomorrow's leagues

		// Get all leagues that were tagged for today/tomorrow
		let dateRange = getDateRange(new Date(), 2)
		let leagues = await getLeaguesByDateRange(dateRange.start, dateRange.end)
		// Update matches for each league
		for (let league of leagues) {
			await updateMatchesByLeague(
				league.league_id,
				dateRange.start,
				dateRange.end
			)
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

    await updateLastDailyRun()
		console.log('Daily cron jobs completed successfully')
	} catch (error) {
		console.error('Error in daily cron jobs:', error)
	}
}

const runHourlyJobs = async () => {
	try {
		// Get all leagues that were tagged for yesterday/today/tomorrow
		// Update yesterday's matches in case they were missed
		let yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
		let dateRange = getDateRange(yesterday, 3)
		let leagues = await getLeaguesByDateRange(dateRange.start, dateRange.end)

		// Update matches for each league
		for (let league of leagues) {
			await updateMatchesByLeague(
				league.league_id,
				dateRange.start,
				dateRange.end
			)
		}

		// Get all matches that are happening yesterday/today/tomorrow
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

// Update odds for matches within 24 hours every 3 hours if the odds are not already updated
const runOddsUpdate = async () => {
	let matches = await getMatchesByDateRange(new Date(), new Date(Date.now() + 24 * 60 * 60 * 1000))
	for (let match of matches) {
		if (!match.home_team_odds || !match.away_team_odds) {
			await updateOddsByMatch(match.match_id, 'SPORTDEVS_API_KEY3') // Use a different key to avoid rate limiting with daily jobs
		}
	}
}

export { runDailyJobs, runHourlyJobs, runOddsUpdate }
