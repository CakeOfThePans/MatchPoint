import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { updateRankings } from '../services/playerService.js'

const prisma = new PrismaClient()

async function main() {
	await updateRankings()
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
