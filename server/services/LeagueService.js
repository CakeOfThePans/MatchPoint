import prisma from '../lib/prisma.js'
import { makeApiCall } from '../utils/apiUtils.js'
import { API_CONFIG } from '../config/apiConfig.js'
import { getDate } from '../utils/dateUtils.js'
import { getSurface } from '../utils/surfaceUtils.js'

export const updateLeaguesByDate = async (date) => {
	try {
		console.log('Updating leagues by date:', date)

		const today = getDate(date)
		let data = await makeApiCall(API_CONFIG.ENDPOINTS.LEAGUES_BY_DATE, {
			date: `eq.${today}`,
		})

		let atpLeagues = data[0].leagues.filter(
			(league) => league.class_name === 'ATP'
		)

		for (let league of atpLeagues) {
			let leagueData = await makeApiCall(API_CONFIG.ENDPOINTS.LEAGUES_INFO, {
				league_id: `eq.${league.league_id}`,
			})

			let leagueInfo = leagueData[0]

			if (leagueInfo.match_type !== 'singles') continue

			await upsertLeague(leagueInfo, date)
		}
	} catch (error) {
		console.error('Error updating leagues:', error)
	}
}

const upsertLeague = async (leagueInfo, date) => {
	try {
		// Generalize the surface type to Hard, Clay, Grass
		const surfaceType = getSurface(leagueInfo.surface_type)

		await prisma.league.upsert({
			where: {
				league_id: leagueInfo.league_id,
			},
			update: {
				competition_name: leagueInfo.competition_name,
				city_name: leagueInfo.city_name,
				surface_type: surfaceType,
				match_type: leagueInfo.match_type,
				number_of_teams: leagueInfo.number_of_teams,
				category: leagueInfo.category,
				last_checked: date,
			},
			create: {
				league_id: leagueInfo.league_id,
				competition_name: leagueInfo.competition_name,
				city_name: leagueInfo.city_name,
				surface_type: surfaceType,
				match_type: leagueInfo.match_type,
				number_of_teams: leagueInfo.number_of_teams,
				category: leagueInfo.category,
				is_grand_slam: false,
				last_checked: date,
			},
		})
		console.log(`League ${leagueInfo.league_id} stored/updated successfully`)
	} catch (error) {
		console.error('Error upserting league:', error)
	}
}

export const getLeaguesByDateRange = async (startDate, endDate) => {
	try {
		const leagues = await prisma.league.findMany({
			where: {
				last_checked: {
					gte: startDate,
					lt: endDate,
				},
			},
		})
		return leagues
	} catch (error) {
		console.error('Error getting leagues by date range:', error)
	}
}
