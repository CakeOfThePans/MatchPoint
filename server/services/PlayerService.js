import prisma from '../lib/prisma.js'
import { fetchPaginatedData, makeApiCall } from '../utils/apiUtils.js'
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
			await upsertRanking(rank)
		}

		console.log(`Successfully processed ${atpRankings.length} player rankings`)
	} catch (error) {
		console.error('Error updating ATP rankings:', error)
	}
}

const upsertRanking = async (rank) => {
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

export const addPlayer = async (playerId) => {
	try {
		let player = await makeApiCall(API_CONFIG.ENDPOINTS.TEAMS, {
			id: `eq.${playerId}`
		})

		if (player.length === 0) {
			console.log(`Player ${playerId} not found`)
			return
		}

		player = player[0]

		await upsertPlayer(player)
		console.log(`Player ${playerId} added successfully`)
		return true
	} catch (error) {
		console.error(`Error adding player ${playerId}:`, error)
		return false
	}
}

export const seedPlayers = async () => {
	try {
		let players = await fetchPaginatedData(API_CONFIG.ENDPOINTS.TEAMS, {
			class_id: 'eq.415'
		}, 'SPORTDEVS_API_KEY3')	// This will likely use around 200 API calls so we'll use a different API key to prevent the main API key from being used up

		// Only keep single players (not doubles)
		players = players.filter((player) => player.type === 1) // 2 is doubles
		
		for (let player of players) {
			await upsertPlayer(player)
		}

		console.log(`Successfully processed ${players.length} players`)
	} catch (error) {
		throw error
	}
}

const upsertPlayer = async (player) => {
	try {
		await prisma.player.upsert({
			where: {
				player_id: player.id,
			},
			update: {
				team_name: player.name,
				team_hash_image: player.hash_image,
			},
			create: {
				player_id: player.id,
				team_name: player.name,
				team_hash_image: player.hash_image,
			},
		})

		console.log(`Player ${player.id} (${player.name}) stored/updated successfully`)
	} catch (error) {
		throw error
	}
}