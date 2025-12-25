import cron from 'node-cron'
import { updateTourJob, updateLiveMatchesJob, updateRankingsJob } from './jobFunctions.js'

// Initialize all cron jobs
const startCronJobs = () => {
	console.log('Initializing cron jobs...')

	// Tour jobs run at 0:30 (12:30 AM) every day in GMT+1
	cron.schedule(
		'30 1 * * *',
		async () => {
			console.log('Running tour jobs at 0:30 AM GMT+1...')
			await updateTourJob()
		},
		{
			timezone: 'Europe/Paris', // GMT+1 (with DST support)
		}
	)

	// Rankings jobs run at 12:30 (12:30 PM) every day in GMT+1
	cron.schedule(
		'30 12 * * *',
		async () => {
			console.log('Running rankings jobs at 12:30 PM GMT+1...')
			await updateRankingsJob()
		},
		{
			timezone: 'Europe/Paris', // GMT+1 (with DST support)
		}
	)

	// Live matches jobs run at the top of every hour in GMT+1
	cron.schedule(
		'0 * * * *',
		async () => {
			console.log('Running live matches jobs every hour...')
			await updateLiveMatchesJob()
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
