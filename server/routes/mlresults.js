import express from 'express'
import {
	getOverallMLResults,
	getAllMLResultsByTournament,
	getMLResultsByTournamentId,
	getMLResultsByGrandSlam,
	getMLResultsBySurface,
} from '../controllers/mlResultController.js'

const router = express.Router()

// GET /api/mlresults/overall - Get overall ML results
router.get('/overall', getOverallMLResults)

// GET /api/mlresults/tournaments - Get all ML results by tournament
router.get('/tournaments', getAllMLResultsByTournament)

// GET /api/mlresults/tournaments/:tournamentId - Get ML results by specific tournament
router.get('/tournaments/:tournamentId', getMLResultsByTournamentId)

// GET /api/mlresults/grand-slam - Get ML results for Grand Slam tournaments only
router.get('/grand-slam', getMLResultsByGrandSlam)

// GET /api/mlresults/surface - Get ML results grouped by surface type
router.get('/surface', getMLResultsBySurface)

export default router
