import React, { useState, useEffect } from 'react'
import { Search, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import MatchCard from '../components/MatchCard'
import TournamentSelect from '../components/TournamentSelect'
import { getMatches, getMatchesByLeague } from '../utils/api'

export const PredictionsPage = () => {
	const [selectedTournament, setSelectedTournament] = useState(null)
	const [searchInput, setSearchInput] = useState('') // Local state for input value
	const [searchQuery, setSearchQuery] = useState('') // Actual search term sent to API
	const [matches, setMatches] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 12,
		total: 0,
		pages: 0,
	})

	// Fetch matches from API
	useEffect(() => {
		const fetchMatches = async () => {
			try {
				setLoading(true)
				setError(null)

				let response
				if (selectedTournament) {
					// Get matches for specific tournament
					response = await getMatchesByLeague(
						selectedTournament,
						false,
						currentPage,
						12,
						searchQuery
					)
				} else {
					// Get all matches
					response = await getMatches(false, currentPage, 12, searchQuery)
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
	}, [selectedTournament, currentPage, searchQuery]) // Re-fetch when tournament, page, or search changes

	// Reset to page 1 when tournament changes
	useEffect(() => {
		setCurrentPage(1)
	}, [selectedTournament])

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

	if (loading) {
		return (
			<div className="bg-gray-50 min-h-screen w-full flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading matches...</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="bg-gray-50 min-h-screen w-full flex items-center justify-center">
				<div className="text-center">
					<p className="text-red-600 mb-4">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
					>
						Try Again
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="bg-gray-50 min-h-screen w-full">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							Upcoming Match Predictions
						</h1>
						<p className="mt-1 text-gray-500">
							View predictions for upcoming tennis matches
						</p>
					</div>
					<div className="mt-4 md:mt-0">
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
								className="block w-full pl-10 pr-10 sm:text-sm border border-gray-300 rounded-md py-3 focus:outline-none focus:border-green-500"
								placeholder="Search by player name..."
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								onKeyDown={handleSearchKeyDown}
							/>
							{(searchInput || searchQuery) && (
								<button
									onClick={handleClear}
									className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
								>
									<X className="h-5 w-5" />
								</button>
							)}
						</div>
						<button
							onClick={handleSearch}
							className="px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none"
						>
							Search
						</button>
					</div>
				</div>
				{/* Group matches by date */}
				<div className="space-y-8">
					{matches.length > 0 ? (
						groupMatchesByDate(matches).map((group) => (
							<div key={group.date}>
								<div className="flex items-center mb-4">
									<Calendar className="h-5 w-5 text-green-600 mr-2" />
									<h2 className="text-xl font-semibold text-gray-900">
										{group.date}
									</h2>
								</div>
								<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
									{group.matches.map((match) => (
										<MatchCard key={match.match_id} match={match} />
									))}
								</div>
							</div>
						))
					) : (
						<div className="text-center py-12">
							<p className="text-gray-500">
								{searchQuery
									? 'No matches found for your search criteria.'
									: 'No upcoming matches available.'}
							</p>
						</div>
					)}
				</div>
				{/* Pagination controls */}
				{pagination.pages > 1 && (
					<div className="mt-8 flex justify-center items-center space-x-2">
						<button
							onClick={handlePreviousPage}
							disabled={currentPage === 1}
							className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
						>
							<ChevronLeft className="h-4 w-4 mr-1" />
							Previous
						</button>

						<div className="flex items-center space-x-1">
							{getPageNumbers().map((page, index) => (
								<button
									key={index}
									onClick={() =>
										typeof page === 'number' ? handlePageChange(page) : null
									}
									disabled={page === '...'}
									className={`px-3 py-2 rounded-md text-sm font-medium ${
										page === '...'
											? 'text-gray-400 cursor-default'
											: currentPage === page
											? 'bg-green-600 text-white'
											: 'text-gray-700 hover:bg-gray-200'
									}`}
								>
									{page}
								</button>
							))}
						</div>

						<button
							onClick={handleNextPage}
							disabled={currentPage === pagination.pages}
							className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
						>
							Next
							<ChevronRight className="h-4 w-4 ml-1" />
						</button>
					</div>
				)}

				{/* Pagination info */}
				{pagination.total > 0 && (
					<div className="mt-4 text-center text-sm text-gray-600">
						Showing {(currentPage - 1) * pagination.limit + 1} to{' '}
						{Math.min(currentPage * pagination.limit, pagination.total)} of{' '}
						{pagination.total} matches
					</div>
				)}
			</div>
		</div>
	)
}

export default PredictionsPage
