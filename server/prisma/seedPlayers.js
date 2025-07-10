import { PrismaClient } from '@prisma/client'
import { seedPlayers } from '../services/PlayerService.js'
import { updateATPRankings } from '../services/PlayerService.js'

const prisma = new PrismaClient()

async function main() {
	console.log('Starting player seeding...')

	try {
		await updateATPRankings()
		await seedPlayers()
		console.log('Player seeding completed successfully!')
	} catch (error) {
		console.error('Error during player seeding:', error)
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
