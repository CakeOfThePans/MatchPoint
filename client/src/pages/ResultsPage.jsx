import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import {
	getOverallMLResults,
	getMLResultsBySurface,
	getMLResultsByLeague,
} from '../utils/api'

export const ResultsPage = () => {
	const [overallResults, setOverallResults] = useState(null)
	const [surfaceResults, setSurfaceResults] = useState([])
	const [leagueResults, setLeagueResults] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [showAllTournaments, setShowAllTournaments] = useState(false)
	const [tournamentSearchQuery, setTournamentSearchQuery] = useState('')

	useEffect(() => {
		const fetchMLResults = async () => {
			try {
				setLoading(true)
				setError(null)

				// Fetch all ML results in parallel
				const [overallData, surfaceData, leagueData] = await Promise.all([
					getOverallMLResults(),
					getMLResultsBySurface(),
					getMLResultsByLeague(),
				])

				setOverallResults(overallData.data)
				setSurfaceResults(surfaceData.data)
				setLeagueResults(leagueData.data)
			} catch (err) {
				console.error('Error fetching ML results:', err)
				setError('Failed to load model results. Please try again later.')
			} finally {
				setLoading(false)
			}
		}

		fetchMLResults()
	}, [])

	return (
		<div className="bg-gray-50 min-h-screen w-full">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Model Results</h1>
				<p className="text-gray-500 mb-8">
					Track our prediction model's performance across different surfaces and tournaments
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
													case 'hardcourt':
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
															{surface.surface_type.charAt(0).toUpperCase() + surface.surface_type.slice(1)}
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

							{/* League accuracy */}
							{leagueResults.length > 0 && (
								<div className="bg-white rounded-lg shadow-md p-6">
									<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
										<h2 className="text-xl font-semibold">
											Tournament Performance
										</h2>
										<div className="mt-2 md:mt-0">
											<div className="relative">
												<input
													type="text"
													className="pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-green-500 w-full md:w-64"
													placeholder="Search tournaments..."
													value={tournamentSearchQuery}
													onChange={(e) =>
														setTournamentSearchQuery(e.target.value)
													}
												/>
												<div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
													<svg
														className="h-4 w-4 text-gray-400"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
														/>
													</svg>
												</div>
											</div>
										</div>
									</div>
									<div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
										{(() => {
											// Filter tournaments based on search query
											const filteredTournaments = leagueResults.filter(
												(league) =>
													league.league.competition_name
														.toLowerCase()
														.includes(tournamentSearchQuery.toLowerCase())
											)

											// Apply show more/less logic to filtered results
											const displayTournaments = showAllTournaments
												? filteredTournaments
												: filteredTournaments.slice(0, 8)

											return displayTournaments.map((league) => {
												const getSurfaceColor = (surfaceType, accuracy) => {
													const accuracyNum = parseFloat(accuracy)

													// Determine color and shade based on surface type and accuracy
													switch (surfaceType.toLowerCase()) {
														case 'hardcourt indoor':
														case 'hardcourt outdoor':
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
													<div key={league.league_id}>
														<div className="flex justify-between mb-1">
															<span className="text-sm font-medium">
																{league.league.competition_name}
															</span>
															<span className="text-sm font-medium text-gray-500">
																{league.accuracy_percentage}%
															</span>
														</div>
														<div className="w-full h-2 bg-gray-200 rounded-full">
															<div
																className={`h-full rounded-full ${getSurfaceColor(
																	league.league.surface_type,
																	league.accuracy_percentage
																)}`}
																style={{
																	width: `${league.accuracy_percentage}%`,
																}}
															/>
														</div>
														<div className="text-xs text-gray-500 mt-1">
															{league.correct_predictions} correct,{' '}
															{league.incorrect_predictions} incorrect
														</div>
													</div>
												)
											})
										})()}
									</div>
									{(() => {
										// Filter tournaments based on search query
										const filteredTournaments = leagueResults.filter((league) =>
											league.league.competition_name
												.toLowerCase()
												.includes(tournamentSearchQuery.toLowerCase())
										)

										// Show button only if there are more than 8 filtered results
										if (filteredTournaments.length > 8) {
											return (
												<div className="mt-6 text-center">
													<button
														onClick={() =>
															setShowAllTournaments(!showAllTournaments)
														}
														className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none cursor-pointer transition-colors"
													>
														{showAllTournaments
															? 'Show Less'
															: `Show More (${
																	filteredTournaments.length - 8
															  } more)`}
													</button>
												</div>
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
