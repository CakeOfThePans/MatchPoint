import prisma from '../lib/prisma.js'
import { makeApiCall } from '../utils/apiUtils.js'
import { API_CONFIG } from '../config/apiConfig.js'

export const updateOddsByMatch = async (matchId, key) => {
	try {
		console.log('Updating odds by match:', matchId)

		let data = await makeApiCall(
			API_CONFIG.ENDPOINTS.ODDS,
			{
				match_id: `eq.${matchId}`,
				is_live: `eq.false`,
			},
			key || 'SPORTDEVS_API_KEY2'
		)

		if (data.length === 0) {
			console.log('No odds found for match:', matchId)
			return false
		}

		let periods = data[0].periods
		// We want the odds for the full match
		let fullMatchOdds = periods.filter(
			(period) => period.period_type === 'Full Time'
		)
		let odds = fullMatchOdds[0].odds.find(
			(odds) =>
				odds.bookmaker_name === 'bet365' || odds.bookmaker_name === 'Bet365'
		)

		// If bet365 odds are not found, use the first odds
		if (!odds) {
			odds = fullMatchOdds[0].odds[0]
		}

		// Update the match with the betting odds
		await prisma.match.update({
			where: { match_id: matchId },
			data: {
				home_team_odds: odds.home,
				away_team_odds: odds.away,
			},
		})
		console.log(`Betting odds for match ${matchId} updated successfully`)
		return true
	} catch (error) {
		console.error('Error updating odds by match:', error)
		return false
	}
}
