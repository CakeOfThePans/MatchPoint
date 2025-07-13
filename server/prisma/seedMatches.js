import { PrismaClient } from '@prisma/client'
import { getDateRangeFromDates } from '../utils/dateUtils.js'
import { updateLeaguesByDate, getLeaguesByDateRange } from '../services/LeagueService.js'
import { updateMatchesByLeague, getMatchesByDateRange } from '../services/MatchService.js'
import { updateOddsByMatch } from '../services/OddsService.js'
import { updatePredictionsByMatch } from '../services/PredictionService.js'
import { updateOverallMLResults, updateMLResultsByLeague } from '../services/MLResultService.js'
import 'dotenv/config'

const prisma = new PrismaClient()

// Get date range from command line arguments (YYYY-MM-DD)
const startDate = process.argv[2] || null
const endDate = process.argv[3] || null
const leagueId = process.argv[4] || null

async function main() {
	console.log('Starting match seeding...')

	try {
		if (startDate && endDate) {
			console.log(`Seeding matches from ${startDate} to ${endDate}`)
		} else {
			console.log('No date range provided, skipping match seeding')
			return
		}

		let dateRange = getDateRangeFromDates(new Date(startDate), new Date(endDate))
		
		let leagues = []
		// Update leagues for the date range if no league id is provided
		if (!leagueId) {
			for (let date = new Date(dateRange.start); date <= dateRange.end; date.setDate(date.getDate() + 1)) {
				await updateLeaguesByDate(date)
			}
			leagues = await getLeaguesByDateRange(dateRange.start, dateRange.end)
			console.log(`Found ${leagues.length} leagues`)
		}
		else {
			leagues = [await prisma.league.findUnique({
				where: {
					league_id: parseInt(leagueId),
				}
			})]
			console.log(`Found ${leagues[0].competition_name}`)
		}

		// Update matches for each league
		for (let league of leagues) {
			await updateMatchesByLeague(league.league_id, dateRange.start, dateRange.end)
		}
		let matches = await getMatchesByDateRange(dateRange.start, dateRange.end)

		// Update odds for each match
		// You can uncomment this if you want to update the odds for each match assuming the api has it (currently not available)
		// for (let match of matches) {
		// 	await updateOddsByMatch(match.match_id)
		// }

		// Update predictions for each match
		matches = await getMatchesByDateRange(dateRange.start, dateRange.end) // Get matches again to get the updated matches
		for (let match of matches) {
			await updatePredictionsByMatch(match)
		}

		// Update ML results
		await updateOverallMLResults()
		for (let league of leagues) {
			await updateMLResultsByLeague(league.league_id)
		}

		console.log('Match seeding completed successfully!')
	} catch (error) {
		console.error('Error during match seeding:', error)
		throw error
	}
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
