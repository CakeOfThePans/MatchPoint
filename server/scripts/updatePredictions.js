import 'dotenv/config'
import { updatePredictionsByMatch } from '../services/PredictionService.js'
import { getMatchesByDateRange } from '../services/MatchService.js'
import { updateOverallMLResults, updateMLResultsByLeague } from '../services/MLResultService.js'
import { getDateRangeFromDates } from '../utils/dateUtils.js'
import prisma from '../lib/prisma.js'

// Get date range from command line arguments (YYYY-MM-DD)
const startDate = process.argv[2] || null
const endDate = process.argv[3] || null

async function main() {
	if (startDate && endDate) {
		console.log(`Updating predictions for matches from ${startDate} to ${endDate}`)
	} else {
		console.log('No date range provided, skipping prediction update')
		return
	}

  let dateRange = getDateRangeFromDates(new Date(startDate), new Date(endDate))

  // Get matches for the date range
  let matches = await getMatchesByDateRange(dateRange.start, dateRange.end)

	// Update predictions for each match, note that it won't update the predictions if the match is finished
	let updatedCount = 0
	for (let match of matches) {
		let updated = await updatePredictionsByMatch(match)
		if (updated) {
			updatedCount++
		}
	}
	console.log(`Successfully updated ${updatedCount} predictions`)

	// Update ML Results with the new predictions
  await updateOverallMLResults()
  let leagues = [...new Set(matches.map(match => match.league_id))]
  for (let league of leagues) {
    await updateMLResultsByLeague(league)
  }

  console.log('ML Results updated successfully!')
}

// Run the script
main().catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
