import express from 'express'
import {
	getAllMatches,
	getMatchById,
	getMatchesByLeague,
} from '../controllers/matchController.js'

const router = express.Router()

// GET /api/matches - Get all matches (with pagination and filtering)
router.get('/', getAllMatches)

// GET /api/matches/:id - Get match by ID
router.get('/:id', getMatchById)

// GET /api/matches/league/:leagueId - Get matches by league
router.get('/league/:leagueId', getMatchesByLeague)

export default router
