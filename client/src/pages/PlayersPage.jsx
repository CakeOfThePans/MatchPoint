import React, { useState, useEffect } from 'react'
import {
	Search,
	User,
	X,
	ChevronLeft,
	ChevronRight,
	Info,
	AlertCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getPlayerRanks } from '../utils/api'
import Tooltip from '../components/Tooltip'

const PlayersPage = () => {
	const navigate = useNavigate()
	const [searchInput, setSearchInput] = useState('') // Local state for input value
	const [searchQuery, setSearchQuery] = useState('') // Actual search term sent to API
	const [players, setPlayers] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [imageErrors, setImageErrors] = useState({})
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 50,
		total: 0,
		pages: 0,
	})

	// Fetch players from API
	useEffect(() => {
		const fetchPlayers = async () => {
			try {
				setLoading(true)
				setError(null)

				const response = await getPlayerRanks(
					currentPage,
					50, // 50 players per page
					'rank',
					'asc',
					searchQuery
				)

				setPlayers(response.data || [])
				setPagination(
					response.pagination || {
						page: currentPage,
						limit: 50,
						total: 0,
						pages: 0,
					}
				)
			} catch (err) {
				console.error('Error fetching players:', err)
				setError('Failed to load rankings. Please try again later.')
			} finally {
				setLoading(false)
			}
		}

		fetchPlayers()
	}, [currentPage, searchQuery]) // Re-fetch when page or search query changes

	// Reset to page 1 when search query changes
	useEffect(() => {
		setCurrentPage(1)
	}, [searchQuery])

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

	// Handle player name click
	const handlePlayerClick = (playerName) => {
		window.scrollTo({ top: 0, behavior: 'smooth' })
		navigate('/predictions', {
			state: {
				searchQuery: playerName,
				predictionType: 'past',
			},
		})
	}

	// Pagination handlers
	const handlePreviousPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1)
			// window.scrollTo({ top: 0, behavior: 'smooth' })
		}
	}

	const handleNextPage = () => {
		if (currentPage < pagination.pages) {
			setCurrentPage(currentPage + 1)
			// window.scrollTo({ top: 0, behavior: 'smooth' })
		}
	}

	const handlePageChange = (page) => {
		setCurrentPage(page)
		// window.scrollTo({ top: 0, behavior: 'smooth' })
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
				<div className="mb-8">
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
						Live ATP Rankings
					</h1>
					<p className="text-gray-600">
						View the latest live ATP rankings in real time.
					</p>
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
						<div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-green-600 text-white">
										<tr>
											<th className="px-1 sm:px-6 py-1 sm:py-4 text-left text-xs sm:text-xs font-medium uppercase tracking-wider">
												<Tooltip content="A player's current ranking based on points earned">
													<div className="flex items-center gap-1">
														Rank
														<Info className="h-3 w-3" />
													</div>
												</Tooltip>
											</th>
											<th className="px-1 sm:px-6 py-1 sm:py-4 text-left text-xs sm:text-xs font-medium uppercase tracking-wider">
												<Tooltip content="The full name of the tennis player. Click to view their past match predictions.">
													<div className="flex items-center gap-1">
														Name
														<Info className="h-3 w-3" />
													</div>
												</Tooltip>
											</th>
											<th className="px-1 sm:px-6 py-1 sm:py-4 text-left text-xs sm:text-xs font-medium uppercase tracking-wider">
												<Tooltip content="A player's real-time points total reflecting points earned and dropped this week.">
													<div className="flex items-center gap-1">
														Points
														<Info className="h-3 w-3" />
													</div>
												</Tooltip>
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{players.length > 0 ? (
											players.map((player) => (
												<tr key={player.player_id} className="hover:bg-gray-50">
													<td className="px-1 sm:px-6 py-1 sm:py-4 whitespace-nowrap">
														<div className="text-sm sm:text-lg font-bold text-gray-900">
															{player.rank || 'N/A'}
														</div>
													</td>
													<td className="px-1 sm:px-6 py-1 sm:py-4">
														<div className="flex items-center">
															<div className="flex-shrink-0 h-6 w-6 sm:h-10 sm:w-10">
																<div className="h-6 w-6 sm:h-10 sm:w-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
																	{!player.hash_image ||
																		player.hash_image === 'https://www.tennisexplorer.com/res/img/default-avatar.jpg' ||
																		imageErrors[player.player_id] ? (
																		<User className="h-3 w-3 sm:h-6 sm:w-6 text-gray-400" />
																	) : (
																		<img
																			src={player.hash_image}
																			alt={player.name}
																			className="h-full w-full object-cover"
																			onError={() =>
																				setImageErrors((prev) => ({
																					...prev,
																					[player.player_id]: true,
																				}))
																			}
																		/>
																	)}
																</div>
															</div>
															<div className="ml-1 sm:ml-4 flex-1 min-w-0">
																<button
																	onClick={() => handlePlayerClick(player.name)}
																	className="text-xs sm:text-sm font-medium text-gray-900 hover:text-green-600 transition-colors duration-200 cursor-pointer text-left break-words"
																>
																	{player.name}
																</button>
															</div>
														</div>
													</td>
													<td className="px-1 sm:px-6 py-1 sm:py-4 whitespace-nowrap">
														<div className="text-xs sm:text-sm text-gray-900">
															{player.points || 'N/A'} pts
														</div>
													</td>
												</tr>
											))
										) : (
											<tr>
												<td
													colSpan="4"
													className="px-2 sm:px-6 py-12 text-center"
												>
													<p className="text-gray-500">
														{searchQuery
															? 'No players found matching your search criteria.'
															: 'No players available.'}
													</p>
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
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
								{pagination.total} players
							</div>
						)}
					</>
				)}
			</div>
		</div>
	)
}

export default PlayersPage
