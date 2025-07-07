//TODO: Remove this file later
import {
	getPredictions,
	runHourlyJobs,
	runDailyJobs,
} from './jobFunctions.js'

import 'dotenv/config'

// runDailyJobs()

const prediction = await getPredictions(1367710)
console.log(prediction)