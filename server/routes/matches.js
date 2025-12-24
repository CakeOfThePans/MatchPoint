import express from 'express'
import {
	getAllMatches,
	getMatchById,
	getMatchesByTournament,
	getMatchesByPlayer,
} from '../controllers/matchController.js'

const router = express.Router()

// GET /api/matches - Get all matches (with pagination and filtering)
router.get('/', getAllMatches)

// GET /api/matches/:id - Get match by ID
router.get('/:id', getMatchById)

// GET /api/matches/tournament/:tournamentId - Get matches by tournament
router.get('/tournament/:tournamentId', getMatchesByTournament)

// GET /api/matches/player/:playerId - Get matches by player
router.get('/player/:playerId', getMatchesByPlayer)

export default router
