import cron from 'node-cron'
import { dailyJobs, hourlyJobs } from './jobFunctions.js'

// Initialize all cron jobs
const startCronJobs = () => {
	console.log('Initializing cron jobs...')

	// Daily jobs run at 0:30 (12:30 AM) every day in GMT+1
	cron.schedule(
		'30 0 * * *',
		async () => {
			console.log('Running daily jobs at 0:30 GMT+1...')
			await dailyJobs()
		},
		{
			timezone: 'Europe/Paris', // GMT+1 (with DST support)
		}
	)

	// Hourly jobs run at the top of every hour in GMT+1
	cron.schedule(
		'0 * * * *',
		async () => {
			console.log('Running hourly jobs...')
			await hourlyJobs()
		},
		{
			timezone: 'Europe/Paris', // GMT+1 (with DST support)
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
