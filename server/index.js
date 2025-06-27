import 'dotenv/config'
import express from 'express'
import prisma from './lib/prisma.js'
import { startCronJobs, stopCronJobs } from './cron/scheduler.js'

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
// TODO: Delete this later
import testRoutes from './routes/test.js'
app.use('/test', testRoutes)

// Error handling middleware
app.use((error, req, res, next) => {
	console.error('Error:', error)
	res.status(500).json({ error: 'Internal server error' })
})

// Graceful shutdown
const gracefulShutdown = async (signal) => {
	console.log(`\n${signal} received. Starting graceful shutdown...`)

	try {
		// Stop cron jobs
		stopCronJobs()
		console.log('Cron jobs stopped')

		await prisma.$disconnect()
		console.log('Prisma client disconnected')
		process.exit(0)
	} catch (error) {
		console.error('Error during shutdown:', error)
		process.exit(1)
	}
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)

	// Start cron jobs after server is running
	startCronJobs()
})
