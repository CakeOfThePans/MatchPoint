import { runDailyJobs, runHourlyJobs } from '../cron/jobFunctions.js'
import { updatePredictionsByMatch } from '../services/PredictionService.js'
import prisma from '../lib/prisma.js'

await runHourlyJobs()