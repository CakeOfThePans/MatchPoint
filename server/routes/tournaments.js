import express from 'express'
import {
	getAllTournaments,
	getTournamentById,
} from '../controllers/tournamentController.js'

const router = express.Router()

// GET /api/tournaments - Get all tournaments
router.get('/', getAllTournaments)

// GET /api/tournaments/:id - Get tournament by ID
router.get('/:id', getTournamentById)

export default router
