import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
	User,
	AlertCircle,
	Calendar,
	Trophy,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react'
import { getPlayerById, getMatchesByPlayer } from '../utils/api'
import { formatPlayerDetails, getLastName } from '../utils/playerHelpers'
import { formatMatchDateTime } from '../utils/dateHelpers'
import { getProbabilityColor } from '../utils/probabilityHelpers'
import {
	formatOdds,
	getPlayerOdds,
	getPlayerPredictionProb,
	didPlayerWin,
} from '../utils/matchHelpers'
import { getPageNumbers } from '../utils/paginationHelpers'

const PlayerPage = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const [player, setPlayer] = useState(null)
	const [upcomingMatches, setUpcomingMatches] = useState([])
	const [latestMatches, setLatestMatches] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [imageError, setImageError] = useState(false)
	const [latestMatchesPage, setLatestMatchesPage] = useState(1)
	const [latestMatchesPagination, setLatestMatchesPagination] = useState({
		page: 1,
		limit: 10,
		total: 0,
		pages: 0,
	})

	useEffect(() => {
		const fetchPlayerData = async () => {
			try {
				setLoading(true)
				setError(null)

				// Fetch player data
				const playerResponse = await getPlayerById(id)
				setPlayer(playerResponse.data)

				// Fetch upcoming matches (not finished)
				const upcomingResponse = await getMatchesByPlayer(id, false, 1, 10)
				setUpcomingMatches(upcomingResponse.data || [])
			} catch (err) {
				console.error('Error fetching player data:', err)
				setError('Failed to load player details. Please try again later.')
			} finally {
				setLoading(false)
			}
		}

		if (id) {
			fetchPlayerData()
		}
	}, [id])

	useEffect(() => {
		const fetchLatestMatches = async () => {
			try {
				const latestResponse = await getMatchesByPlayer(
					id,
					true,
					latestMatchesPage,
					10
				)
				setLatestMatches(latestResponse.data || [])
				setLatestMatchesPagination(
					latestResponse.pagination || {
						page: latestMatchesPage,
						limit: 10,
						total: 0,
						pages: 0,
					}
				)
			} catch (err) {
				console.error('Error fetching latest matches:', err)
			}
		}

		if (id) {
			fetchLatestMatches()
		}
	}, [id, latestMatchesPage])

	if (loading) {
		return (
			<div className="flex items-center justify-center py-16 min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
					<p className="mt-3 text-gray-600">Loading player details...</p>
				</div>
			</div>
		)
	}

	if (error || !player) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="bg-red-50 border border-red-200 rounded-md p-4">
					<div className="flex items-center">
						<AlertCircle className="h-5 w-5 text-red-400 mr-2" />
						<p className="text-red-800">{error || 'Player not found'}</p>
					</div>
				</div>
			</div>
		)
	}

	const playerDetails = formatPlayerDetails(player)

	const handleMatchClick = (matchId) => {
		navigate(`/match/${matchId}`)
	}

	// Pagination handlers for latest matches
	const handlePreviousPage = () => {
		if (latestMatchesPage > 1) {
			setLatestMatchesPage(latestMatchesPage - 1)
			window.scrollTo({ top: 0, behavior: 'smooth' })
		}
	}

	const handleNextPage = () => {
		if (latestMatchesPage < latestMatchesPagination.pages) {
			setLatestMatchesPage(latestMatchesPage + 1)
			window.scrollTo({ top: 0, behavior: 'smooth' })
		}
	}

	const handlePageChange = (page) => {
		setLatestMatchesPage(page)
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	return (
		<div className="bg-gray-50 min-h-screen w-full">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Player Header */}
				<div className="bg-white rounded-lg shadow-md p-6 mb-6">
					<div className="flex flex-col md:flex-row items-center md:items-center gap-6">
						{/* Player Image */}
						<div className="w-48 h-48 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
							{!player.hash_image ||
							player.hash_image ===
								'https://www.tennisexplorer.com/res/img/default-avatar.jpg' ||
							imageError ? (
								<User className="h-24 w-24 text-gray-400" />
							) : (
								<img
									src={player.hash_image}
									alt={player.name}
									className="w-full h-full object-cover"
									onError={() => setImageError(true)}
								/>
							)}
						</div>

						{/* Player Info */}
						<div className="flex-1 text-center md:text-left">
							<h1 className="text-3xl font-bold text-gray-900 mb-4">
								{player.name}
							</h1>

							{/* Player Details Table */}
							{playerDetails.length > 0 && (
								<div className="overflow-x-auto">
									<table className="min-w-full">
										<tbody>
											{playerDetails.map((detail, index) => (
												<tr
													key={index}
													className={
														index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'
													}
												>
													<td
														className={`px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 ${
															index === 0 ? 'rounded-tl-lg' : ''
														} ${
															index === playerDetails.length - 1
																? 'rounded-bl-lg'
																: ''
														}`}
													>
														{detail.label}
													</td>
													<td
														className={`px-4 py-3 whitespace-nowrap text-sm text-gray-600 ${
															index === 0 ? 'rounded-tr-lg' : ''
														} ${
															index === playerDetails.length - 1
																? 'rounded-br-lg'
																: ''
														}`}
													>
														{detail.value}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Upcoming Matches */}
				{upcomingMatches.length > 0 && (
					<div className="bg-white rounded-lg shadow-md p-6 mb-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
							<Calendar className="h-5 w-5 mr-2 text-green-600" />
							Upcoming Matches
						</h2>
						<div className="overflow-x-auto rounded-lg overflow-hidden">
							<table className="min-w-full">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Date
										</th>
										<th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Time
										</th>
										<th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Match
										</th>
										<th className="hidden sm:table-cell px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Tournament
										</th>
										<th className="hidden md:table-cell px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Surface
										</th>
										<th className="hidden md:table-cell px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
											Odds
										</th>
										<th className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
											Win Prob
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{upcomingMatches.map((match, index) => {
										const homeTeam = match.home_team
										const awayTeam = match.away_team
										const playerOdds = getPlayerOdds(match, id)
										const playerProb = getPlayerPredictionProb(match, id)
										const { date, time } = formatMatchDateTime(match.start_time)
										const isLastRow = index === upcomingMatches.length - 1

										return (
											<tr
												key={match.match_id}
												className={`${
													index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
												} hover:bg-gray-100 cursor-pointer transition-colors group`}
												onClick={() => handleMatchClick(match.match_id)}
											>
												<td
													className={`px-2 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-600 ${
														index === 0 ? 'rounded-tl-lg' : ''
													} ${isLastRow ? 'rounded-bl-lg' : ''}`}
												>
													{date}
												</td>
												<td className="px-2 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-600">
													{time}
												</td>
												<td className="px-2 sm:px-4 py-3 text-sm text-gray-900 group-hover:text-green-600 transition-colors">
													<span className="font-medium">
														<span className="sm:hidden">
															{getLastName(homeTeam?.name || '-')}
														</span>
														<span className="hidden sm:inline">
															{homeTeam?.name || '-'}
														</span>
													</span>{' '}
													vs{' '}
													<span className="font-medium">
														<span className="sm:hidden">
															{getLastName(awayTeam?.name || '-')}
														</span>
														<span className="hidden sm:inline">
															{awayTeam?.name || '-'}
														</span>
													</span>
												</td>
												<td className="hidden sm:table-cell px-2 sm:px-4 py-3 text-sm text-gray-600">
													{match.tournament?.tournament_name || '-'}
												</td>
												<td className="hidden md:table-cell px-2 sm:px-4 py-3 text-sm text-gray-600">
													{match.tournament?.surface_type || '-'}
												</td>
												<td className="hidden md:table-cell px-2 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">
													{formatOdds(playerOdds)}
												</td>
												<td
													className={`px-2 sm:px-4 py-3 whitespace-nowrap text-sm text-center ${
														index === 0 ? 'rounded-tr-lg' : ''
													} ${isLastRow ? 'rounded-br-lg' : ''}`}
												>
													{playerProb !== null && playerProb !== undefined ? (
														<span
															className={`px-2 py-1 rounded-full text-xs font-medium ${getProbabilityColor(
																playerProb
															)}`}
														>
															{(playerProb * 100).toFixed(1)}%
														</span>
													) : (
														'-'
													)}
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* Latest Matches */}
				{latestMatches.length > 0 && (
					<div className="bg-white rounded-lg shadow-md p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
							<Trophy className="h-5 w-5 mr-2 text-green-600" />
							Latest Matches
						</h2>
						<div className="overflow-x-auto rounded-lg overflow-hidden">
							<table className="min-w-full">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Date
										</th>
										<th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Match
										</th>
										<th className="hidden sm:table-cell px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Tournament
										</th>
										<th className="hidden md:table-cell px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Surface
										</th>
										<th className="hidden md:table-cell px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
											Score
										</th>
										<th className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
											Result
										</th>
										<th className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
											Prediction
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{latestMatches.map((match, index) => {
										const homeTeam = match.home_team
										const awayTeam = match.away_team
										const won = didPlayerWin(match, id)
										const isLastRow = index === latestMatches.length - 1
										const { date } = formatMatchDateTime(match.start_time)
										const predictionCorrect =
											match.winner_id &&
											match.winner_prediction_id &&
											match.winner_id === match.winner_prediction_id

										return (
											<tr
												key={match.match_id}
												className={`${
													index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
												} hover:bg-gray-100 cursor-pointer transition-colors group`}
												onClick={() => handleMatchClick(match.match_id)}
											>
												<td
													className={`px-2 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-600 ${
														index === 0 ? 'rounded-tl-lg' : ''
													} ${isLastRow ? 'rounded-bl-lg' : ''}`}
												>
													{date}
												</td>
												<td className="px-2 sm:px-4 py-3 text-sm text-gray-900 group-hover:text-green-600 transition-colors">
													<span className="font-medium">
														<span className="sm:hidden">
															{getLastName(homeTeam?.name || '-')}
														</span>
														<span className="hidden sm:inline">
															{homeTeam?.name || '-'}
														</span>
													</span>{' '}
													vs{' '}
													<span className="font-medium">
														<span className="sm:hidden">
															{getLastName(awayTeam?.name || '-')}
														</span>
														<span className="hidden sm:inline">
															{awayTeam?.name || '-'}
														</span>
													</span>
												</td>
												<td className="hidden sm:table-cell px-2 sm:px-4 py-3 text-sm text-gray-600">
													{match.tournament?.tournament_name || '-'}
												</td>
												<td className="hidden md:table-cell px-2 sm:px-4 py-3 text-sm text-gray-600">
													{match.tournament?.surface_type || '-'}
												</td>
												<td className="hidden md:table-cell px-2 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">
													{match.score || '-'}
												</td>
												<td className="px-2 sm:px-4 py-3 whitespace-nowrap text-center">
													<span
														className={`px-2 py-1 rounded-full text-xs font-semibold ${
															won
																? 'bg-green-100 text-green-700'
																: 'bg-red-100 text-red-700'
														}`}
													>
														{won ? 'Won' : 'Lost'}
													</span>
												</td>
												<td
													className={`px-2 sm:px-4 py-3 whitespace-nowrap text-center ${
														index === 0 ? 'rounded-tr-lg' : ''
													} ${isLastRow ? 'rounded-br-lg' : ''}`}
												>
													{match.winner_id && match.winner_prediction_id ? (
														<span
															className={`px-2 py-1 rounded-full text-xs font-semibold ${
																predictionCorrect
																	? 'bg-green-100 text-green-700'
																	: 'bg-red-100 text-red-700'
															}`}
														>
															{predictionCorrect ? 'Correct' : 'Incorrect'}
														</span>
													) : (
														'-'
													)}
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>

						{/* Pagination controls */}
						{latestMatchesPagination.pages > 1 && (
							<div className="mt-6 sm:mt-8 flex justify-center items-center space-x-1 sm:space-x-3">
								<button
									onClick={handlePreviousPage}
									disabled={latestMatchesPage === 1}
									className="px-1.5 sm:px-4 py-1 sm:py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer text-xs sm:text-base"
								>
									<ChevronLeft className="h-3 w-3 sm:h-5 sm:w-5 mr-0.5 sm:mr-2" />
									<span className="hidden sm:inline">Previous</span>
									<span className="sm:hidden">Prev</span>
								</button>

								<div className="flex items-center space-x-0.5 sm:space-x-2">
									{getPageNumbers(
										latestMatchesPage,
										latestMatchesPagination.pages
									).map((page, index) => (
										<button
											key={index}
											onClick={() =>
												typeof page === 'number' ? handlePageChange(page) : null
											}
											disabled={page === '...'}
											className={`px-1.5 sm:px-4 py-1 sm:py-2.5 rounded-md text-xs sm:text-base font-medium min-w-[24px] sm:min-w-[44px] ${
												page === '...'
													? 'text-gray-400 cursor-default'
													: latestMatchesPage === page
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
									disabled={latestMatchesPage === latestMatchesPagination.pages}
									className="px-1.5 sm:px-4 py-1 sm:py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer text-xs sm:text-base"
								>
									<span className="hidden sm:inline">Next</span>
									<span className="sm:hidden">Next</span>
									<ChevronRight className="h-3 w-3 sm:h-5 sm:w-5 ml-0.5 sm:ml-2" />
								</button>
							</div>
						)}

						{/* Pagination info */}
						{latestMatchesPagination.total > 0 && (
							<div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-600">
								Showing{' '}
								{(latestMatchesPage - 1) * latestMatchesPagination.limit + 1} to{' '}
								{Math.min(
									latestMatchesPage * latestMatchesPagination.limit,
									latestMatchesPagination.total
								)}{' '}
								of {latestMatchesPagination.total} matches
							</div>
						)}
					</div>
				)}

				{/* No matches message */}
				{upcomingMatches.length === 0 && latestMatches.length === 0 && (
					<div className="bg-white rounded-lg shadow-md p-6 text-center">
						<p className="text-gray-500">No matches found for this player.</p>
					</div>
				)}
			</div>
		</div>
	)
}

export default PlayerPage
