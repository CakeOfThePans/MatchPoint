import React, { useState, useEffect } from 'react'
import {
	Search,
	Calendar,
	ChevronLeft,
	ChevronRight,
	X,
	AlertCircle,
	Info,
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import MatchCard from '../components/MatchCard'
import TournamentSelect from '../components/TournamentSelect'
import { getMatches, getMatchesByLeague } from '../utils/api'

export const PredictionsPage = () => {
	const location = useLocation()

	// Initialize state with navigation values
	const initialSearchQuery = location.state?.searchQuery || ''
	const initialPredictionType = location.state?.predictionType || 'upcoming'

	const [selectedTournament, setSelectedTournament] = useState(null)
	const [searchInput, setSearchInput] = useState(initialSearchQuery) // Local state for input value
	const [searchQuery, setSearchQuery] = useState(initialSearchQuery) // Actual search term sent to API
	const [matches, setMatches] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [predictionType, setPredictionType] = useState(initialPredictionType) // 'upcoming' or 'past'
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 12,
		total: 0,
		pages: 0,
	})

	const [showInfoModal, setShowInfoModal] = useState(false)

	// Fetch matches from API
	useEffect(() => {
		const fetchMatches = async () => {
			try {
				setLoading(true)
				setError(null)

				const finishedOnly = predictionType === 'past'

				let response
				if (selectedTournament) {
					// Get matches for specific tournament
					response = await getMatchesByLeague(
						selectedTournament,
						finishedOnly,
						currentPage,
						12,
						searchQuery
					)
				} else {
					// Get all matches
					response = await getMatches(
						finishedOnly,
						currentPage,
						12,
						searchQuery
					)
				}

				setMatches(response.data || [])
				setPagination(
					response.pagination || {
						page: currentPage,
						limit: 12,
						total: 0,
						pages: 0,
					}
				)
			} catch (err) {
				console.error('Error fetching matches:', err)
				setError('Failed to load matches. Please try again later.')
			} finally {
				setLoading(false)
			}
		}

		fetchMatches()
	}, [selectedTournament, currentPage, searchQuery, predictionType]) // Re-fetch when tournament, page, search, or prediction type changes

	// Reset to page 1 when tournament or prediction type changes
	useEffect(() => {
		setCurrentPage(1)
	}, [selectedTournament, predictionType])

	// Handle search button click
	const handleSearch = () => {
		setSearchQuery(searchInput.trim())
		setCurrentPage(1) // Reset to page 1 when searching
	}

	// Handle clear button click
	const handleClear = () => {
		setSearchInput('')
		setSearchQuery('')
		setCurrentPage(1) // Reset to page 1 when clearing
	}

	// Handle Enter key press in search input
	const handleSearchKeyDown = (e) => {
		if (e.key === 'Enter') {
			handleSearch()
		}
	}

	// Helper function to group matches by date
	function groupMatchesByDate(matches) {
		const grouped = matches.reduce((acc, match) => {
			const date = new Date(match.start_time)
			const dateStr = date.toLocaleDateString('en-US', {
				weekday: 'long',
				month: 'long',
				day: 'numeric',
				year: 'numeric',
			})
			const existingGroup = acc.find((group) => group.date === dateStr)
			if (existingGroup) {
				existingGroup.matches.push(match)
			} else {
				acc.push({
					date: dateStr,
					matches: [match],
				})
			}
			return acc
		}, [])

		return grouped
	}

	// Pagination handlers
	const handlePreviousPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1)
			window.scrollTo({ top: 0, behavior: 'smooth' })
		}
	}

	const handleNextPage = () => {
		if (currentPage < pagination.pages) {
			setCurrentPage(currentPage + 1)
			window.scrollTo({ top: 0, behavior: 'smooth' })
		}
	}

	const handlePageChange = (page) => {
		setCurrentPage(page)
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	// Generate page numbers for pagination
	const getPageNumbers = () => {
		const pages = []
		const totalPages = pagination.pages
		const current = currentPage

		if (totalPages <= 7) {
			// Show all pages if 7 or fewer
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i)
			}
		} else {
			// Show first page, last page, current page, and 2 pages around current
			if (current <= 4) {
				for (let i = 1; i <= 5; i++) {
					pages.push(i)
				}
				pages.push('...')
				pages.push(totalPages)
			} else if (current >= totalPages - 3) {
				pages.push(1)
				pages.push('...')
				for (let i = totalPages - 4; i <= totalPages; i++) {
					pages.push(i)
				}
			} else {
				pages.push(1)
				pages.push('...')
				for (let i = current - 1; i <= current + 1; i++) {
					pages.push(i)
				}
				pages.push('...')
				pages.push(totalPages)
			}
		}

		return pages
	}

	return (
		<div className="bg-gray-50 min-h-screen w-full">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
					<div>
						<div className="flex items-center gap-3">
							<h1 className="text-3xl font-bold text-gray-900">
								Match Predictions
							</h1>
							<button
								onClick={() => setShowInfoModal(true)}
								className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
								title="Learn more about this page"
							>
								<Info className="h-5 w-5" />
							</button>
						</div>
						<p className="mt-1 text-gray-500">
							View predictions for{' '}
							{predictionType === 'upcoming' ? 'upcoming' : 'past'} tennis
							matches
						</p>
					</div>
					<div className="mt-4 md:mt-0 flex items-center gap-3">
						{/* Prediction Type Toggle */}
						<div className="inline-flex bg-gray-100 rounded-md p-1 border border-gray-200 shadow-sm">
							<button
								onClick={() => setPredictionType('upcoming')}
								className={`px-2 xs:px-4 py-2 rounded text-sm font-medium transition-all cursor-pointer ${
									predictionType === 'upcoming'
										? 'bg-white text-green-700 shadow-sm'
										: 'text-gray-500 hover:text-gray-700'
								}`}
							>
								Upcoming
							</button>
							<button
								onClick={() => setPredictionType('past')}
								className={`px-2 xs:px-4 py-2 rounded text-sm font-medium transition-all cursor-pointer ${
									predictionType === 'past'
										? 'bg-white text-green-700 shadow-sm'
										: 'text-gray-500 hover:text-gray-700'
								}`}
							>
								Past
							</button>
						</div>
						<TournamentSelect
							onSelect={setSelectedTournament}
							selectedId={selectedTournament}
						/>
					</div>
				</div>
				{/* Search bar */}
				<div className="mb-8">
					<div className="flex gap-3">
						<div className="relative flex-1">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Search className="h-5 w-5 text-gray-400" />
							</div>
							<input
								type="text"
								className="block w-full pl-10 pr-10 sm:text-sm bg-white border border-gray-300 rounded-md py-3 focus:outline-none focus:border-green-500"
								placeholder="Search by player name..."
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								onKeyDown={handleSearchKeyDown}
							/>
							{(searchInput || searchQuery) && (
								<button
									onClick={handleClear}
									className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
								>
									<X className="h-5 w-5" />
								</button>
							)}
						</div>
						<button
							onClick={handleSearch}
							className="px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none cursor-pointer"
						>
							Search
						</button>
					</div>
				</div>

				{/* Loading state for matches area */}
				{loading ? (
					<div className="flex items-center justify-center py-16">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
							<p className="mt-3 text-gray-600">Loading matches...</p>
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
						{/* Group matches by date */}
						<div className="space-y-8">
							{(() => {
								// Filter matches based on prediction type
								const filteredMatches =
									predictionType === 'past'
										? matches.filter((match) => match.winner_id) // In case a match doesn't have a winner then don't show it
										: matches

								return filteredMatches.length > 0 ? (
									groupMatchesByDate(filteredMatches).map((group) => (
										<div key={group.date}>
											<div className="flex items-center mb-4">
												<Calendar className="h-5 w-5 text-green-600 mr-2" />
												<h2 className="text-xl font-semibold text-gray-900">
													{group.date}
												</h2>
											</div>
											<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
												{group.matches.map((match) => (
													<MatchCard
														key={match.match_id}
														match={match}
														isPast={predictionType === 'past'}
													/>
												))}
											</div>
										</div>
									))
								) : (
									<div className="text-center py-12">
										<p className="text-gray-500">
											{searchQuery
												? 'No matches found for your search criteria.'
												: predictionType === 'past'
												? 'No completed matches available.'
												// : 'No upcoming matches available.'}
												: 'Unfortunately, the tennis API we relied on has discontinued its free plan, so upcoming match data is no longer available. However, you can still explore our past predictions from when the platform was live.' }
										</p>
									</div>
								)
							})()}
						</div>
						{/* Pagination controls */}
						{pagination.pages > 1 && (
							<div className="mt-6 sm:mt-8 flex justify-center items-center space-x-1 sm:space-x-3">
								<button
									onClick={handlePreviousPage}
									disabled={currentPage === 1}
									className="px-1.5 sm:px-4 py-1 sm:py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer text-xs sm:text-base"
								>
									<ChevronLeft className="h-3 w-3 sm:h-5 sm:w-5 mr-0.5 sm:mr-2" />
									<span className="hidden sm:inline">Previous</span>
									<span className="sm:hidden">Prev</span>
								</button>

								<div className="flex items-center space-x-0.5 sm:space-x-2">
									{getPageNumbers().map((page, index) => (
										<button
											key={index}
											onClick={() =>
												typeof page === 'number' ? handlePageChange(page) : null
											}
											disabled={page === '...'}
											className={`px-1.5 sm:px-4 py-1 sm:py-2.5 rounded-md text-xs sm:text-base font-medium min-w-[24px] sm:min-w-[44px] ${
												page === '...'
													? 'text-gray-400 cursor-default'
													: currentPage === page
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
									disabled={currentPage === pagination.pages}
									className="px-1.5 sm:px-4 py-1 sm:py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer text-xs sm:text-base"
								>
									<span className="hidden sm:inline">Next</span>
									<span className="sm:hidden">Next</span>
									<ChevronRight className="h-3 w-3 sm:h-5 sm:w-5 ml-0.5 sm:ml-2" />
								</button>
							</div>
						)}

						{/* Pagination info */}
						{pagination.total > 0 && (
							<div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-600">
								Showing {(currentPage - 1) * pagination.limit + 1} to{' '}
								{Math.min(currentPage * pagination.limit, pagination.total)} of{' '}
								{pagination.total} matches
							</div>
						)}
					</>
				)}
			</div>

			{/* Info Modal */}
			{showInfoModal && (
				<div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
					<div className="bg-white border border-gray-200 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
									<Info className="h-5 w-5 text-green-600" />
									About Match Predictions
								</h2>
								<button
									onClick={() => setShowInfoModal(false)}
									className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
								>
									<X className="h-5 w-5" />
								</button>
							</div>

							<div className="space-y-4 text-gray-700">
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										Page Overview
									</h3>
									<p>
										The Match Predictions page displays tennis match predictions
										using our advanced machine learning model. You can view both
										upcoming matches with predictions and past matches with
										actual results.
									</p>
								</div>

								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										Key Features
									</h3>
									<ul className="list-disc list-inside space-y-1 ml-4">
										<li>
											<strong>Toggle View:</strong> Switch between "Upcoming"
											and "Past" matches using the toggle buttons
										</li>
										<li>
											<strong>Tournament Filter:</strong> Select specific
											tournaments to filter matches
										</li>
										<li>
											<strong>Search:</strong> Find matches by player name using
											the search bar
										</li>
										<li>
											<strong>Pagination:</strong> Navigate through multiple
											pages of matches
										</li>
										<li>
											<strong>Date Grouping:</strong> Matches are organized by
											date for easy browsing
										</li>
									</ul>
								</div>

								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										Win Probability & Models
									</h3>
									<ul className="list-disc list-inside space-y-1 ml-4">
										<li>
											<strong>Win Probability:</strong> Percentage showing each
											player's predicted chance of winning the match
										</li>
										<li>
											<strong>Model Information:</strong> Hover over the info
											icon next to the match name to see which model was used
											and its description
											<ul className="list-disc list-inside space-y-1 ml-4 mt-1">
												<li>
													<strong>Primary Model:</strong> Full features
													(surface, ranks, points, odds) - Most accurate
												</li>
												<li>
													<strong>Secondary Model:</strong> Odds-only (surface,
													odds)
												</li>
												<li>
													<strong>Tertiary Model:</strong> Rank-only (surface,
													ranks, points)
												</li>
											</ul>
										</li>
										<li>
											<strong>Dynamic Updates:</strong> Win probabilities are
											updated based on changes in betting odds and market
											conditions
										</li>
										<li>
											<strong>Model Prioritization:</strong> The system
											automatically prioritizes higher-tier models when
											available data allows
										</li>
									</ul>
								</div>

								<div className="bg-blue-50 border border-blue-200 rounded-md p-3">
									<p className="text-blue-800 text-sm">
										<strong>Note:</strong> Predictions are based on historical
										data and machine learning algorithms. They should be used
										for informational purposes only and not as the sole basis
										for betting decisions.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default PredictionsPage
