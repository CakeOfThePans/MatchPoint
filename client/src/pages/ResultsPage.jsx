import React, { useState, useEffect } from 'react'
import {
	CheckCircle,
	XCircle,
	AlertCircle,
	ChevronLeft,
	ChevronRight,
	Search,
	X,
} from 'lucide-react'
import {
	getOverallMLResults,
	getMLResultsBySurface,
	getMLResultsByTournament,
} from '../utils/api'
import { getPageNumbers } from '../utils/paginationHelpers'

export const ResultsPage = () => {
	const [overallResults, setOverallResults] = useState(null)
	const [surfaceResults, setSurfaceResults] = useState([])
	const [tournamentResults, setTournamentResults] = useState([])
	const [tournamentPagination, setTournamentPagination] = useState({
		page: 1,
		limit: 10,
		total: 0,
		pages: 0,
	})
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [tournamentSearchInput, setTournamentSearchInput] = useState('') // Local state for input value
	const [tournamentSearchQuery, setTournamentSearchQuery] = useState('') // Actual search term sent to API
	const [tournamentPage, setTournamentPage] = useState(1)
	const TOURNAMENTS_PER_PAGE = 10

	// Fetch overall and surface results once on mount
	useEffect(() => {
		const fetchOverallAndSurface = async () => {
			try {
				const [overallData, surfaceData] = await Promise.all([
					getOverallMLResults(),
					getMLResultsBySurface(),
				])

				setOverallResults(overallData.data)
				setSurfaceResults(surfaceData.data)
			} catch (err) {
				console.error('Error fetching ML results:', err)
			}
		}

		fetchOverallAndSurface()
	}, [])

	// Reset to page 1 when search query changes
	useEffect(() => {
		setTournamentPage(1)
	}, [tournamentSearchQuery])

	// Handle search button click
	const handleTournamentSearch = () => {
		setTournamentSearchQuery(tournamentSearchInput.trim())
		setTournamentPage(1) // Reset to page 1 when searching
	}

	// Handle clear button click
	const handleTournamentClear = () => {
		setTournamentSearchInput('')
		setTournamentSearchQuery('')
		setTournamentPage(1) // Reset to page 1 when clearing
	}

	// Handle Enter key press in search input
	const handleTournamentSearchKeyDown = (e) => {
		if (e.key === 'Enter') {
			handleTournamentSearch()
		}
	}

	// Fetch tournament results with pagination
	useEffect(() => {
		const fetchTournamentResults = async () => {
			try {
				setLoading(true)
				setError(null)

				const tournamentData = await getMLResultsByTournament(
					tournamentPage,
					TOURNAMENTS_PER_PAGE,
					tournamentSearchQuery
				)

				setTournamentResults(tournamentData.data || [])
				setTournamentPagination(
					tournamentData.pagination || {
						page: tournamentPage,
						limit: TOURNAMENTS_PER_PAGE,
						total: 0,
						pages: 0,
					}
				)
			} catch (err) {
				console.error('Error fetching tournament results:', err)
				setError('Failed to load tournament results. Please try again later.')
			} finally {
				setLoading(false)
			}
		}

		fetchTournamentResults()
	}, [tournamentPage, tournamentSearchQuery])

	return (
		<div className="bg-gray-50 min-h-screen w-full">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Model Results</h1>
				<p className="text-gray-500 mb-8">
					Track our prediction model's performance across different surfaces and
					tournaments
				</p>

				{/* Loading state */}
				{loading ? (
					<div className="flex items-center justify-center py-16">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
							<p className="mt-3 text-gray-600">Loading rankings...</p>
						</div>
					</div>
				) : error ? (
					<div className="mb-8 bg-red-50 border border-red-200 rounded-md p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<AlertCircle className="h-5 w-5 text-red-400 mr-2" />
								<p className="text-red-800">{error}</p>
							</div>
							<button
								onClick={() => window.location.reload()}
								className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
							>
								Try Again
							</button>
						</div>
					</div>
				) : (
					<>
						<div className="space-y-8">
							{/* Overall performance card */}
							{overallResults && (
								<div className="bg-white rounded-lg shadow-md p-6">
									<h2 className="text-xl font-semibold mb-4">
										Overall Performance
									</h2>
									<div className="grid gap-6 md:grid-cols-2 justify-items-center">
										<div className="bg-green-50 rounded-lg p-4 text-center w-full">
											<div className="text-4xl font-bold text-green-600">
												{overallResults.accuracy_percentage}%
											</div>
											<p className="text-gray-600 mt-1">Overall Accuracy</p>
										</div>
										<div className="bg-green-50 rounded-lg p-4 flex items-center justify-center w-full">
											<div className="flex items-center mx-auto">
												<CheckCircle className="h-6 w-6 text-green-600 mr-2" />
												<div>
													<div className="text-2xl font-bold">
														{overallResults.correct_predictions}
													</div>
													<p className="text-gray-600 text-sm">Correct</p>
												</div>
											</div>
											<div className="mx-4 text-gray-300 text-2xl">|</div>
											<div className="flex items-center mx-auto">
												<XCircle className="h-6 w-6 text-red-500 mr-2" />
												<div>
													<div className="text-2xl font-bold">
														{overallResults.incorrect_predictions}
													</div>
													<p className="text-gray-600 text-sm">Incorrect</p>
												</div>
											</div>
										</div>
									</div>
								</div>
							)}

							{/* Surface accuracy */}
							{surfaceResults.length > 0 && (
								<div className="bg-white rounded-lg shadow-md p-6">
									<h2 className="text-xl font-semibold mb-4">
										Surface Accuracy
									</h2>
									<div className="grid gap-6 md:grid-cols-3">
										{surfaceResults.map((surface) => {
											const getSurfaceColor = (surfaceType) => {
												switch (surfaceType.toLowerCase()) {
													case 'hard':
														return 'bg-blue-500'
													case 'clay':
														return 'bg-orange-500'
													case 'grass':
														return 'bg-green-500'
												}
											}

											return (
												<div key={surface.surface_type}>
													<div className="flex justify-between mb-1">
														<span className="text-sm font-medium">
															{surface.surface_type.charAt(0).toUpperCase() +
																surface.surface_type.slice(1)}
														</span>
														<span className="text-sm font-medium text-gray-500">
															{surface.accuracy_percentage}%
														</span>
													</div>
													<div className="w-full h-3 bg-gray-200 rounded-full">
														<div
															className={`h-full rounded-full ${getSurfaceColor(
																surface.surface_type
															)}`}
															style={{
																width: `${surface.accuracy_percentage}%`,
															}}
														/>
													</div>
													<div className="text-xs text-gray-500 mt-1">
														{surface.correct_predictions} correct,{' '}
														{surface.incorrect_predictions} incorrect
													</div>
												</div>
											)
										})}
									</div>
								</div>
							)}

							{/* Tournament accuracy */}
							{tournamentResults.length > 0 && (
								<div className="bg-white rounded-lg shadow-md p-6">
									<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
										<h2 className="text-xl font-semibold">
											Tournament Performance
										</h2>
										<div className="mt-2 md:mt-0">
											<div className="flex gap-3">
												<div className="relative flex-1 md:flex-none md:w-64">
													<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
														<Search className="h-5 w-5 text-gray-400" />
													</div>
													<input
														type="text"
														className="block w-full pl-10 pr-10 sm:text-sm bg-white border border-gray-300 rounded-md py-2 focus:outline-none focus:border-green-500"
														placeholder="Search tournaments..."
														value={tournamentSearchInput}
														onChange={(e) =>
															setTournamentSearchInput(e.target.value)
														}
														onKeyDown={handleTournamentSearchKeyDown}
													/>
													{(tournamentSearchInput || tournamentSearchQuery) && (
														<button
															onClick={handleTournamentClear}
															className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
														>
															<X className="h-5 w-5" />
														</button>
													)}
												</div>
												<button
													onClick={handleTournamentSearch}
													className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none cursor-pointer"
												>
													Search
												</button>
											</div>
										</div>
									</div>
									<div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
										{tournamentResults.map((tournamentResult) => {
											const getSurfaceColor = (surfaceType, accuracy) => {
												const accuracyNum = parseFloat(accuracy)

												// Determine color and shade based on surface type and accuracy
												switch (surfaceType.toLowerCase()) {
													case 'hard':
														if (accuracyNum >= 80) return 'bg-blue-600'
														if (accuracyNum >= 70) return 'bg-blue-500'
														if (accuracyNum >= 60) return 'bg-blue-400'
														if (accuracyNum >= 50) return 'bg-blue-300'
														return 'bg-blue-200'
													case 'clay':
														if (accuracyNum >= 80) return 'bg-orange-600'
														if (accuracyNum >= 70) return 'bg-orange-500'
														if (accuracyNum >= 60) return 'bg-orange-400'
														if (accuracyNum >= 50) return 'bg-orange-300'
														return 'bg-orange-200'
													case 'grass':
														if (accuracyNum >= 80) return 'bg-green-600'
														if (accuracyNum >= 70) return 'bg-green-500'
														if (accuracyNum >= 60) return 'bg-green-400'
														if (accuracyNum >= 50) return 'bg-green-300'
														return 'bg-green-200'
													default:
														return 'bg-gray-200'
												}
											}

											return (
												<div key={tournamentResult.tournament_id}>
													<div className="flex justify-between mb-1">
														<span className="text-sm font-medium">
															{tournamentResult.tournament.tournament_name}
														</span>
														<span className="text-sm font-medium text-gray-500">
															{tournamentResult.accuracy_percentage}%
														</span>
													</div>
													<div className="w-full h-2 bg-gray-200 rounded-full">
														<div
															className={`h-full rounded-full ${getSurfaceColor(
																tournamentResult.tournament.surface_type,
																tournamentResult.accuracy_percentage
															)}`}
															style={{
																width: `${tournamentResult.accuracy_percentage}%`,
															}}
														/>
													</div>
													<div className="text-xs text-gray-500 mt-1">
														{tournamentResult.correct_predictions} correct,{' '}
														{tournamentResult.incorrect_predictions} incorrect
													</div>
												</div>
											)
										})}
									</div>
									{(() => {
										// Pagination handlers
										const handlePreviousPage = () => {
											if (tournamentPage > 1) {
												setTournamentPage(tournamentPage - 1)
												window.scrollTo({ top: 0, behavior: 'smooth' })
											}
										}

										const handleNextPage = () => {
											if (tournamentPage < tournamentPagination.pages) {
												setTournamentPage(tournamentPage + 1)
												window.scrollTo({ top: 0, behavior: 'smooth' })
											}
										}

										const handlePageChange = (page) => {
											setTournamentPage(page)
											window.scrollTo({ top: 0, behavior: 'smooth' })
										}

										if (tournamentPagination.pages > 1) {
											return (
												<>
													{/* Pagination controls */}
													<div className="mt-6 sm:mt-8 flex justify-center items-center space-x-1 sm:space-x-3">
														<button
															onClick={handlePreviousPage}
															disabled={tournamentPage === 1}
															className="px-1.5 sm:px-4 py-1 sm:py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer text-xs sm:text-base"
														>
															<ChevronLeft className="h-3 w-3 sm:h-5 sm:w-5 mr-0.5 sm:mr-2" />
															<span className="hidden sm:inline">Previous</span>
															<span className="sm:hidden">Prev</span>
														</button>

														<div className="flex items-center space-x-0.5 sm:space-x-2">
															{getPageNumbers(
																tournamentPage,
																tournamentPagination.pages
															).map((page, index) => (
																<button
																	key={index}
																	onClick={() =>
																		typeof page === 'number'
																			? handlePageChange(page)
																			: null
																	}
																	disabled={page === '...'}
																	className={`px-1.5 sm:px-4 py-1 sm:py-2.5 rounded-md text-xs sm:text-base font-medium min-w-[24px] sm:min-w-[44px] ${
																		page === '...'
																			? 'text-gray-400 cursor-default'
																			: tournamentPage === page
																			? 'bg-green-600 text-white'
																			: 'text-gray-700 hover:bg-gray-200 cursor-pointer'
																	}`}
																>
																	{page}
																</button>
															))}
														</div>

														<button
															onClick={handleNextPage}
															disabled={
																tournamentPage === tournamentPagination.pages
															}
															className="px-1.5 sm:px-4 py-1 sm:py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer text-xs sm:text-base"
														>
															<span className="hidden sm:inline">Next</span>
															<span className="sm:hidden">Next</span>
															<ChevronRight className="h-3 w-3 sm:h-5 sm:w-5 ml-0.5 sm:ml-2" />
														</button>
													</div>

													{/* Pagination info */}
													{tournamentPagination.total > 0 && (
														<div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-600">
															Showing{' '}
															{(tournamentPage - 1) * TOURNAMENTS_PER_PAGE + 1}{' '}
															to{' '}
															{Math.min(
																tournamentPage * TOURNAMENTS_PER_PAGE,
																tournamentPagination.total
															)}{' '}
															of {tournamentPagination.total} tournaments
														</div>
													)}
												</>
											)
										}
										return null
									})()}
								</div>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	)
}

export default ResultsPage
