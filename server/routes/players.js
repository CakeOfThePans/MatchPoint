import express from 'express'
import {
	getPlayerRanks,
	getPlayerById,
} from '../controllers/playerController.js'

const router = express.Router()

// GET /api/players - Get player ranks (with pagination, sorting, and search)
router.get('/', getPlayerRanks)

// GET /api/players/:id - Get player by ID
router.get('/:id', getPlayerById)

export default router
