import { scrapeAtpRankings } from '../webscraper/rankingsScraper.js'
import prisma from '../lib/prisma.js'
import { PAGE_LIMIT } from '../webscraper/config.js'

/**
 * Helper function to find or create a player by name.
 * Returns the player_id.
 */
export const findOrCreatePlayer = async (playerData) => {
	if (!playerData || !playerData.name) {
		return null
	}

	// Try to find existing player by name
	let player = await prisma.player.findFirst({
		where: {
			name: playerData.name,
		},
	})

	// Prepare update data - only include fields that have values
	const updateData = {}
	if (playerData.birthdate) updateData.birth_date = playerData.birthdate
	if (playerData.height) {
		const heightNum = parseInt(playerData.height)
		if (!isNaN(heightNum)) updateData.height = heightNum
	}
	if (playerData.weight) {
		const weightNum = parseInt(playerData.weight)
		if (!isNaN(weightNum)) updateData.weight = weightNum
	}
	if (playerData.plays) updateData.plays = playerData.plays
	if (playerData.imageUrl) updateData.hash_image = playerData.imageUrl

	if (player) {
		// Update player if we have new information
		if (Object.keys(updateData).length > 0) {
			player = await prisma.player.update({
				where: {
					player_id: player.player_id,
				},
				data: updateData,
			})
		}
		return player.player_id
	} else {
		// Create new player
		const newPlayer = await prisma.player.create({
			data: {
				name: playerData.name,
				...updateData,
			},
		})
		return newPlayer.player_id
	}
}

export const updateRankings = async () => {
	try {
		console.log('Updating rankings...')

		// Get all rankings and store locally
		console.log('Scraping all rankings pages...')
		const allRankings = []

		for (let page = 1; page <= PAGE_LIMIT; page++) {
			console.log(`Scraping rankings page ${page}...`)

			// Scrape current page
			const rankings = await scrapeAtpRankings(page)

			if (!rankings || rankings.length === 0) {
				console.log(`No rankings found on page ${page}, stopping`)
				break
			}

			// Store rankings locally
			allRankings.push(...rankings)
			console.log(`Scraped page ${page} (${rankings.length} players)`)

			// add a delay of anywhere between 3-7 seconds
			await new Promise((resolve) =>
				setTimeout(resolve, Math.random() * 4000 + 3000)
			)
		}

		console.log(`Total rankings scraped: ${allRankings.length}`)

		// Clear all rankings in the database
		console.log('Clearing all player rankings from database...')
		await prisma.player.updateMany({
			data: {
				rank: null,
				points: null,
			},
		})
		console.log('Cleared all player rankings')

		// Insert new rankings into the database
		console.log('Inserting new rankings into database...')
		for (const ranking of allRankings) {
			if (!ranking.name || !ranking.rank || !ranking.points) continue

			try {
				// Try to find existing player by name
				const existingPlayer = await prisma.player.findFirst({
					where: {
						name: ranking.name,
					},
				})

				if (existingPlayer) {
					// Update existing player's ranking
					await prisma.player.update({
						where: {
							player_id: existingPlayer.player_id,
						},
						data: {
							rank: ranking.rank,
							points: ranking.points,
						},
					})
				} else {
					// Create new player if not found
					await prisma.player.create({
						data: {
							name: ranking.name,
							rank: ranking.rank,
							points: ranking.points,
						},
					})
				}
			} catch (error) {
				console.error(
					`Error updating ranking for player ${ranking.name}:`,
					error
				)
				// Continue with next player even if one fails
			}
		}

		console.log('Rankings update completed')
	} catch (error) {
		console.error('Error in updating rankings:', error)
		throw error
	}
}
