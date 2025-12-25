import cron from 'node-cron'
import {
	updateTourJob,
	updateLiveMatchesJob,
	updateRankingsJob,
} from './jobFunctions.js'

// Initialize all cron jobs
const startCronJobs = () => {
	console.log('Initializing cron jobs...')

	// Tour jobs run at 0:30 (12:30 AM) every day in GMT+1
	// If it fails, retry after 10 minutes (max 2 retries)
	const MAX_RETRIES = 2
	const runTourJobWithRetry = async (retryCount = 0) => {
		if (retryCount > 0) {
			console.log(
				`Retrying tour jobs (attempt ${retryCount}/${MAX_RETRIES})...`
			)
		} else {
			console.log('Running tour jobs at 0:30 AM GMT+1...')
		}

		const success = await updateTourJob()

		if (!success) {
			if (retryCount < MAX_RETRIES) {
				console.log(
					`Tour jobs failed. Scheduling retry ${
						retryCount + 1
					}/${MAX_RETRIES} in 10 minutes...`
				)
				setTimeout(() => {
					runTourJobWithRetry(retryCount + 1)
				}, 10 * 60 * 1000) // 10 minutes in milliseconds
			} else {
				console.error(
					`Tour jobs failed after ${MAX_RETRIES} retries. Giving up.`
				)
			}
		}
	}

	cron.schedule(
		'30 0 * * *',
		async () => {
			await runTourJobWithRetry(0)
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
