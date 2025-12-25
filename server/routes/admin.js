import express from 'express'
import { apiKeyAuth } from '../middleware/apiKeyAuth.js'
import {
	updateRankingsJob,
	updateTourJob,
	updateLiveMatchesJob,
} from '../cron/jobFunctions.js'

const router = express.Router()

// Apply API key authentication to all admin routes
router.use(apiKeyAuth)

// POST /api/admin/update-rankings - Run rankings update job
router.post('/update-rankings', async (req, res) => {
	try {
		console.log('Admin: Running updateRankingsJob...')
		const success = await updateRankingsJob()
		if (success) {
			return res.status(200).json({
				success: true,
				message: 'Rankings update job completed successfully',
				timestamp: new Date().toISOString(),
			})
		} else {
			return res.status(500).json({
				success: false,
				error: 'Failed to run rankings update job',
				message: 'Failed to run rankings update job',
			})
		}
	} catch (error) {
		console.error('Admin: Error running updateRankingsJob:', error)
		return res.status(500).json({
			success: false,
			error: 'Failed to run rankings update job',
			message: error.message,
		})
	}
})

// POST /api/admin/update-tournaments - Run tournament and matches update job
router.post('/update-tournaments', async (req, res) => {
	try {
		console.log('Admin: Running updateTourJob...')
		const success = await updateTourJob()
		if (success) {
			return res.status(200).json({
				success: true,
				message: 'Tournament update job completed successfully',
				timestamp: new Date().toISOString(),
			})
		} else {
			return res.status(500).json({
				success: false,
				error: 'Failed to run tournament update job',
				message: 'Failed to run tournament update job',
			})
		}
	} catch (error) {
		console.error('Admin: Error running updateTourJob:', error)
		return res.status(500).json({
			success: false,
			error: 'Failed to run tournament update job',
			message: error.message,
		})
	}
})

// POST /api/admin/update-live-matches - Run live matches update job
router.post('/update-live-matches', async (req, res) => {
	try {
		console.log('Admin: Running updateLiveMatchesJob...')
		const success = await updateLiveMatchesJob()
		if (success) {
			return res.status(200).json({
				success: true,
				message: 'Live matches update job completed successfully',
				timestamp: new Date().toISOString(),
			})
		} else {
			return res.status(500).json({
				success: false,
				error: 'Failed to run live matches update job',
				message: 'Failed to run live matches update job',
			})
		}
	} catch (error) {
		console.error('Admin: Error running updateLiveMatchesJob:', error)
		return res.status(500).json({
			success: false,
			error: 'Failed to run live matches update job',
			message: error.message,
		})
	}
})

export default router