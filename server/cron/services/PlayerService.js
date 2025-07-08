import prisma from '../../lib/prisma.js'
import { fetchPaginatedData } from '../utils/apiUtils.js'
import { API_CONFIG } from '../config/apiConfig.js'

export const updateATPRankings = async () => {
	try {
		console.log('Updating ATP rankings...')

		let atpRankings = await fetchPaginatedData(API_CONFIG.ENDPOINTS.RANKINGS, {
			type: 'eq.atp',
			class: 'eq.now',
		})

		// Reset all player rankings to null
		// This is to ensure that anyone who is no longer in the top 500 will have their rank reset since the API only returns the top 500
		// And this'll reset the rankings at the end of the year as well
		await prisma.player.updateMany({
			data: {
				rank: null,
				points: null,
				next_win_points: null,
			},
		})

		for (let rank of atpRankings) {
			await upsertPlayer(rank)
		}

    console.log(`Successfully processed ${atpRankings.length} player rankings`)
	} catch (error) {
		console.error('Error updating ATP rankings:', error)
	}
}

const upsertPlayer = async (rank) => {
	try {
		await prisma.player.upsert({
			where: {
				player_id: rank.team_id,
			},
			update: {
				team_name: rank.team_name,
				team_hash_image: rank.team_hash_image,
				rank: rank.rank,
				points: rank.points,
				next_win_points: rank.next_win_points,
			},
			create: {
				player_id: rank.team_id,
				team_name: rank.team_name,
				team_hash_image: rank.team_hash_image,
				rank: rank.rank,
				points: rank.points,
				next_win_points: rank.next_win_points,
			},
		})

		console.log(
			`Player ${rank.team_id} (${rank.team_name}) - Rank ${rank.rank} stored/updated successfully`
		)
	} catch (error) {
		console.error(`Error storing player ${rank.team_id}:`, error)
	}
}
