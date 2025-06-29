import express from 'express'
import {
	getAllLeagues,
	getLeagueById,
} from '../controllers/leagueController.js'

const router = express.Router()

// GET /api/leagues - Get all leagues
router.get('/', getAllLeagues)

// GET /api/leagues/:id - Get league by ID
router.get('/:id', getLeagueById)

export default router
