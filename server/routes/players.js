import express from 'express'
import {
	getAllPlayers,
	getPlayerById,
} from '../controllers/playerController.js'

const router = express.Router()

// GET /api/players - Get all players (with pagination and sorting)
router.get('/', getAllPlayers)

// GET /api/players/:id - Get player by ID
router.get('/:id', getPlayerById)

export default router
