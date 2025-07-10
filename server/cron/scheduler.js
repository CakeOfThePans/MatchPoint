import cron from 'node-cron'
import { runDailyJobs, runHourlyJobs } from './jobFunctions.js'
import prisma from '../lib/prisma.js'
import { getDate } from '../utils/dateUtils.js'

// Check if daily jobs have run today
const hasDailyJobsRunToday = async () => {
	const lastRunRecord = await prisma.mLResultOverall.findFirst()

	if (!lastRunRecord || !lastRunRecord.last_daily_run) {
		return false
	}

	const lastRunDate = new Date(lastRunRecord.last_daily_run)

	// Compare the dates not the time
	return getDate(lastRunDate) === getDate(new Date())
}

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
			// If the daily jobs haven't run today, run them now
			if (!(await hasDailyJobsRunToday())) {
				await runDailyJobs()
			}
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