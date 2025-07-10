import cron from 'node-cron'
import { runDailyJobs, runHourlyJobs } from './jobFunctions.js'

// Initialize all cron jobs
const startCronJobs = () => {
	console.log('Initializing cron jobs...')

	// Daily job - runs at 12:00 AM (midnight) every day
	cron.schedule(
		'0 0 * * *',
		async () => {
			console.log('Running daily cron jobs at:', new Date().toISOString())
			await runDailyJobs()
		},
		{
			scheduled: true,
			timezone: 'UTC',
		}
	)

	// Hourly job - runs every hour at hh:30
	cron.schedule(
		'30 * * * *',
		async () => {
			console.log('Running hourly cron jobs at:', new Date().toISOString())
			await runHourlyJobs()
		},
		{
			scheduled: true,
			timezone: 'UTC',
		}
	)

	console.log('Cron jobs initialized successfully')
}

// Stop all cron jobs
const stopCronJobs = () => {
	cron.getTasks().forEach((task) => task.stop())
	console.log('All cron jobs stopped')
}

export { startCronJobs, stopCronJobs }
