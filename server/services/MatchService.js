import prisma from '../lib/prisma.js'
import { fetchPaginatedData } from '../utils/apiUtils.js'
import { API_CONFIG } from '../config/apiConfig.js'
import { getDate } from '../utils/dateUtils.js'
import { getSurface } from '../utils/surfaceUtils.js'
import { addPlayer } from './PlayerService.js'

export const updateMatchesByLeague = async (leagueId, startDate, endDate) => {
	try {
		console.log('Updating matches...')

		// Increment the end date by 1 day since the API isn't inclusive of the end date
		endDate.setDate(endDate.getDate() + 1)

		let matches = await fetchPaginatedData(API_CONFIG.ENDPOINTS.MATCHES, {
			start_time: [`gte.${getDate(startDate)}`, `lt.${getDate(endDate)}`],
			league_id: `eq.${leagueId}`,
		})

		for (let match of matches) {
			try {
				// Ignore matches with unidentified players (players that are not in the database most likely outside of the top 500)
				const homePlayer = await prisma.player.findUnique({
					where: {
						player_id: match.home_team_id,
					},
				})
				const awayPlayer = await prisma.player.findUnique({
					where: {
						player_id: match.away_team_id,
					},
				})

				// If the player is not in the database, add them and continue if it didn't add them successfully
				if (!homePlayer && !(await addPlayer(match.home_team_id))) continue
				if (!awayPlayer && !(await addPlayer(match.away_team_id))) continue

				await upsertMatch(match)
			} catch (error) {
				console.error(`Error processing match ${match.id}:`, error)
			}
		}

		console.log(`Successfully processed ${matches.length} matches`)
	} catch (error) {
		console.error('Error updating matches:', error)
	}
}

const upsertMatch = async (match) => {
	try {
		// Generalize the surface type to Hard, Clay, Grass
		const surfaceType = getSurface(match.ground_type)

		// Get the specific start time for the match if available
		let start_time = new Date(match.start_time)
		if (match.times?.specific_start_time) {
			start_time = new Date(match.times.specific_start_time)
		}

		await prisma.match.upsert({
			where: {
				match_id: match.id,
			},
			update: {
				name: match.name,
				ground_type: surfaceType,
				status_type: match.status_type,
				home_team_id: match.home_team_id,
				home_team_name: match.home_team_name,
				home_team_hash_image: match.home_team_hash_image,
				away_team_id: match.away_team_id,
				away_team_name: match.away_team_name,
				away_team_hash_image: match.away_team_hash_image,
				start_time: start_time,
				season_name: match.season_name,
				league_id: match.league_id,
			},
			create: {
				match_id: match.id,
				name: match.name,
				ground_type: surfaceType,
				status_type: match.status_type,
				home_team_id: match.home_team_id,
				home_team_name: match.home_team_name,
				home_team_hash_image: match.home_team_hash_image,
				away_team_id: match.away_team_id,
				away_team_name: match.away_team_name,
				away_team_hash_image: match.away_team_hash_image,
				start_time: start_time,
				season_name: match.season_name,
				league_id: match.league_id,
			},
		})

		// Update the winner if the match is finished and the scores are available
		if (
			match.home_team_score &&
			match.away_team_score &&
			match.status_type === 'finished'
		) {
			let winnerId = null
			let winnerName = null

			// Get the period arrays for both teams
			let homePeriods = [
				match.home_team_score.period_1,
				match.home_team_score.period_2,
				match.home_team_score.period_3,
				match.home_team_score.period_4,
				match.home_team_score.period_5,
			].filter((score) => score !== undefined)

			let awayPeriods = [
				match.away_team_score.period_1,
				match.away_team_score.period_2,
				match.away_team_score.period_3,
				match.away_team_score.period_4,
				match.away_team_score.period_5,
			].filter((score) => score !== undefined)

			// Determine winner based off current scores
			if (match.home_team_score.current > match.away_team_score.current) {
				winnerId = match.home_team_id
				winnerName = match.home_team_name
			} else if (
				match.away_team_score.current > match.home_team_score.current
			) {
				winnerId = match.away_team_id
				winnerName = match.away_team_name
			}
			// Sometimes, the API didn't update the final score, so we need to check the last period ourselves
			else {
				// Get the last period scores to determine actual winner
				let homeLastPeriod = homePeriods[homePeriods.length - 1]
				let awayLastPeriod = awayPeriods[awayPeriods.length - 1]

				if (homeLastPeriod > awayLastPeriod) {
					winnerId = match.home_team_id
					winnerName = match.home_team_name
				} else if (awayLastPeriod > homeLastPeriod) {
					winnerId = match.away_team_id
					winnerName = match.away_team_name
				}
				// If the last periods are equal (most likely 6-6 or just some error like 0-0), unfortunately we can't determine the winner
				// We'll have to manually update the score in the database
			}

			// Update the match with the winner
			await prisma.match.update({
				where: { match_id: match.id },
				data: {
					winner_id: winnerId,
					winner_name: winnerName,
				},
			})
		}
		console.log(`Match ${match.id} (${match.name}) stored/updated successfully`)
	} catch (error) {
		console.error(`Error upserting match ${match.id}:`, error)
	}
}

export const getMatchesByDateRange = async (startDate, endDate) => {
	try {
		const matches = await prisma.match.findMany({
			where: {
				start_time: {
					gte: startDate,
					lt: endDate,
				},
			},
			include: {
				home_team: true,
				away_team: true,
			},
		})
		return matches
	} catch (error) {
		console.error('Error getting matches by date range:', error)
	}
}
