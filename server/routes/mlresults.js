import express from 'express'
import {
	getOverallMLResults,
	getAllMLResultsByLeague,
	getMLResultsByLeagueId,
	getMLResultsByGrandSlam,
	getMLResultsBySurface,
} from '../controllers/mlResultController.js'

const router = express.Router()

// GET /api/mlresults/overall - Get overall ML results
router.get('/overall', getOverallMLResults)

// GET /api/mlresults/leagues - Get all ML results by league
router.get('/leagues', getAllMLResultsByLeague)

// GET /api/mlresults/leagues/:leagueId - Get ML results by specific league
router.get('/leagues/:leagueId', getMLResultsByLeagueId)

// GET /api/mlresults/grand-slam - Get ML results for Grand Slam tournaments only
router.get('/grand-slam', getMLResultsByGrandSlam)

// GET /api/mlresults/surface - Get ML results grouped by surface type
router.get('/surface', getMLResultsBySurface)

export default router
