import { updateLiveMatchesJob, updateTourJob } from '../cron/jobFunctions.js'
import { updateTournaments } from '../services/tournamentService.js'

async function main(){
	await updateTourJob()
}

main()