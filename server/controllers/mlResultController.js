import prisma from '../lib/prisma.js'

// Get overall ML results
const getOverallMLResults = async (req, res) => {
	try {
		const mlResults = await prisma.mLResultOverall.findFirst({
			where: {
				id: 1,
			},
		})

		if (!mlResults) {
			return res.status(404).json({
				success: false,
				error: 'ML results not found',
			})
		}

		const totalPredictions =
			mlResults.correct_predictions + mlResults.incorrect_predictions
		const accuracy =
			totalPredictions > 0
				? ((mlResults.correct_predictions / totalPredictions) * 100).toFixed(2)
				: 0

		res.status(200).json({
			success: true,
			data: {
				...mlResults,
				total_predictions: totalPredictions,
				accuracy_percentage: parseFloat(accuracy),
			},
		})
	} catch (error) {
		console.error('Error fetching overall ML results:', error)
		res.status(500).json({
			success: false,
			error: 'Failed to fetch overall ML results',
		})
	}
}

// Get all ML results by tournament
const getAllMLResultsByTournament = async (req, res) => {
	try {
		const mlResults = await prisma.mLResultByTournament.findMany({
			include: {
				tournament: {
					select: {
						tournament_id: true,
						tournament_name: true,
						is_grand_slam: true,
						surface_type: true,
					},
				},
			},
			orderBy: {
				tournament: {
					last_updated: 'desc',
				},
			},
		})

		// Calculate accuracy for each tournament
		const resultsWithAccuracy = mlResults.map((result) => {
			const totalPredictions =
				result.correct_predictions + result.incorrect_predictions
			const accuracy =
				totalPredictions > 0
					? ((result.correct_predictions / totalPredictions) * 100).toFixed(2)
					: 0

			return {
				...result,
				total_predictions: totalPredictions,
				accuracy_percentage: parseFloat(accuracy),
			}
		})

		res.status(200).json({
			success: true,
			data: resultsWithAccuracy,
		})
	} catch (error) {
		console.error('Error fetching ML results by tournament:', error)
		res.status(500).json({
			success: false,
			error: 'Failed to fetch ML results by tournament',
		})
	}
}

// Get ML results by specific tournament
const getMLResultsByTournamentId = async (req, res) => {
	try {
		const { tournamentId } = req.params
		const tournamentIdInt = parseInt(tournamentId)

		if (isNaN(tournamentIdInt)) {
			return res.status(400).json({
				success: false,
				error: 'Invalid tournament ID',
			})
		}

		const mlResult = await prisma.mLResultByTournament.findUnique({
			where: {
				tournament_id: tournamentIdInt,
			},
			include: {
				tournament: {
					select: {
						tournament_id: true,
						tournament_name: true,
						is_grand_slam: true,
						surface_type: true,
					},
				},
			},
		})

		if (!mlResult) {
			return res.status(404).json({
				success: false,
				error: 'ML results for this tournament not found',
			})
		}

		const totalPredictions =
			mlResult.correct_predictions + mlResult.incorrect_predictions
		const accuracy =
			totalPredictions > 0
				? ((mlResult.correct_predictions / totalPredictions) * 100).toFixed(2)
				: 0

		res.status(200).json({
			success: true,
			data: {
				...mlResult,
				total_predictions: totalPredictions,
				accuracy_percentage: parseFloat(accuracy),
			},
		})
	} catch (error) {
		console.error('Error fetching ML results by tournament ID:', error)
		res.status(500).json({
			success: false,
			error: 'Failed to fetch ML results by tournament ID',
		})
	}
}

// Get ML results for Grand Slam tournaments only
const getMLResultsByGrandSlam = async (req, res) => {
	try {
		const mlResults = await prisma.mLResultByTournament.findMany({
			where: {
				tournament: {
					is_grand_slam: true,
				},
			},
			include: {
				tournament: {
					select: {
						tournament_id: true,
						tournament_name: true,
						is_grand_slam: true,
						surface_type: true,
					},
				},
			},
			orderBy: {
				tournament: {
					last_updated: 'desc',
				},
			},
		})

		// Calculate accuracy for each Grand Slam
		const resultsWithAccuracy = mlResults.map((result) => {
			const totalPredictions =
				result.correct_predictions + result.incorrect_predictions
			const accuracy =
				totalPredictions > 0
					? ((result.correct_predictions / totalPredictions) * 100).toFixed(2)
					: 0

			return {
				...result,
				total_predictions: totalPredictions,
				accuracy_percentage: parseFloat(accuracy),
			}
		})

		res.status(200).json({
			success: true,
			data: resultsWithAccuracy,
		})
	} catch (error) {
		console.error('Error fetching Grand Slam ML results:', error)
		res.status(500).json({
			success: false,
			error: 'Failed to fetch Grand Slam ML results',
		})
	}
}

// Get ML results grouped by surface type
const getMLResultsBySurface = async (req, res) => {
	try {
		const mlResults = await prisma.mLResultByTournament.findMany({
			include: {
				tournament: {
					select: {
						tournament_id: true,
						tournament_name: true,
						is_grand_slam: true,
						surface_type: true,
					},
				},
			},
		})

		// Group results by surface type
		const surfaceGroups = {
			hard: {
				surface_type: 'hard',
				correct_predictions: 0,
				incorrect_predictions: 0,
				total_predictions: 0,
				accuracy_percentage: 0,
			},
			clay: {
				surface_type: 'clay',
				correct_predictions: 0,
				incorrect_predictions: 0,
				total_predictions: 0,
				accuracy_percentage: 0,
			},
			grass: {
				surface_type: 'grass',
				correct_predictions: 0,
				incorrect_predictions: 0,
				total_predictions: 0,
				accuracy_percentage: 0,
			},
		}

		mlResults.forEach((result) => {
			// Convert surface type to lowercase
			let surfaceType = result.tournament.surface_type.toLowerCase()

			surfaceGroups[surfaceType].correct_predictions +=
				result.correct_predictions
			surfaceGroups[surfaceType].incorrect_predictions +=
				result.incorrect_predictions
		})

		// Calculate totals and accuracy for each surface type
		const resultsBySurface = Object.values(surfaceGroups).map((group) => {
			const totalPredictions =
				group.correct_predictions + group.incorrect_predictions
			const accuracy =
				totalPredictions > 0
					? ((group.correct_predictions / totalPredictions) * 100).toFixed(2)
					: 0

			return {
				...group,
				total_predictions: totalPredictions,
				accuracy_percentage: parseFloat(accuracy),
			}
		})

		res.status(200).json({
			success: true,
			data: resultsBySurface,
		})
	} catch (error) {
		console.error('Error fetching ML results by surface:', error)
		res.status(500).json({
			success: false,
			error: 'Failed to fetch ML results by surface',
		})
	}
}

export {
	getOverallMLResults,
	getAllMLResultsByTournament,
	getMLResultsByTournamentId,
	getMLResultsByGrandSlam,
	getMLResultsBySurface,
}
