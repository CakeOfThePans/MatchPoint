import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
	Calendar,
	Clock,
	User,
	AlertCircle,
	Trophy,
	TrendingUp,
} from 'lucide-react'
import { getMatchById } from '../utils/api'

const MatchPage = () => {
	const { id } = useParams()
	const [match, setMatch] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [homeImageError, setHomeImageError] = useState(false)
	const [awayImageError, setAwayImageError] = useState(false)

	useEffect(() => {
		const fetchMatch = async () => {
			try {
				setLoading(true)
				setError(null)
				const response = await getMatchById(id)
				setMatch(response.data)
			} catch (err) {
				console.error('Error fetching match:', err)
				setError('Failed to load match details. Please try again later.')
			} finally {
				setLoading(false)
			}
		}

		if (id) {
			fetchMatch()
		}
	}, [id])

	if (loading) {
		return (
			<div className="flex items-center justify-center py-16 min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
					<p className="mt-3 text-gray-600">Loading match details...</p>
				</div>
			</div>
		)
	}

	const homeTeam = match.home_team
	const awayTeam = match.away_team
	const tournament = match.tournament

	if (error || !match || !homeTeam || !awayTeam || !tournament) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="bg-red-50 border border-red-200 rounded-md p-4">
					<div className="flex items-center">
						<AlertCircle className="h-5 w-5 text-red-400 mr-2" />
						<p className="text-red-800">{error || 'Match not found'}</p>
					</div>
				</div>
			</div>
		)
	}

	const date = new Date(match.start_time)
	const formattedDate = date.toLocaleDateString('en-US', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})
	const minutes = date.getMinutes()
	const flooredMinutes = Math.floor(minutes / 5) * 5
	const flooredDate = new Date(date)
	flooredDate.setMinutes(flooredMinutes, 0, 0)
	const formattedTime = flooredDate.toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
	})

	// Prediction probabilities
	const homeTeamProb = match.home_team_prediction_prob
		? match.home_team_prediction_prob * 100
		: null
	const awayTeamProb = match.away_team_prediction_prob
		? match.away_team_prediction_prob * 100
		: null

	// Format odds
	const formatOdds = (odds) => {
		if (!odds) return 'N/A'
		return odds.toFixed(2)
	}

	// Format player details - always show all fields, use "-" if not available
	const formatPlayerDetails = (player) => {
		const details = []

		// Rank
		details.push({
			label: 'Rank',
			value: player.rank ? `#${player.rank}` : '-',
		})

		// Points
		details.push({
			label: 'Points',
			value: player.points ? player.points.toLocaleString() : '-',
		})

		// Age
		if (player.birth_date) {
			const birthDate = new Date(player.birth_date)
			const age = Math.floor(
				(new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000)
			)
			details.push({ label: 'Age', value: age })
		} else {
			details.push({ label: 'Age', value: '-' })
		}

		// Height
		details.push({
			label: 'Height',
			value: player.height ? `${player.height} cm` : '-',
		})

		// Weight
		details.push({
			label: 'Weight',
			value: player.weight ? `${player.weight} kg` : '-',
		})

		// Plays
		details.push({
			label: 'Plays',
			value: player.plays || '-',
		})

		return details
	}

	const homeDetails = formatPlayerDetails(homeTeam)
	const awayDetails = formatPlayerDetails(awayTeam)

	return (
		<div className="bg-gray-50 min-h-screen w-full">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Match Header */}
				<div className="bg-white rounded-lg shadow-md p-6 mb-6">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
						<div>
							<h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
								{match.name}
							</h1>
							<div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
								<div className="flex items-center">
									<Calendar className="h-4 w-4 mr-2" />
									<span>{formattedDate}</span>
								</div>
								<div className="flex items-center">
									<Clock className="h-4 w-4 mr-2" />
									<span>{formattedTime}</span>
								</div>
								<div>
									<span className="font-medium">Tournament:</span>{' '}
									<span>{tournament.tournament_name}</span>
								</div>
								<div>
									<span className="font-medium">Surface:</span>{' '}
									<span>{tournament.surface_type}</span>
								</div>
							</div>
						</div>
						{match.winner_id && (
							<div className="mt-4 md:mt-0 flex flex-col items-end">
								<div className="flex items-center text-green-700 mb-2">
									<Trophy className="h-5 w-5 mr-2" />
									<span className="font-semibold">
										Winner: {match.winner_name}
									</span>
								</div>
								{match.score && (
									<div className="text-sm text-gray-600">
										<span className="font-medium">Score:</span> {match.score}
									</div>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Prediction Bar */}
				{(homeTeamProb !== null || awayTeamProb !== null) && (
					<div className="bg-white rounded-lg shadow-md p-6 mb-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
							<TrendingUp className="h-5 w-5 mr-2 text-green-600" />
							Win Probability Prediction
						</h2>
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<span className="font-medium text-gray-700">
										{homeTeam.name}
									</span>
								</div>
								<div className="flex items-center">
									<span className="ml-2 font-medium text-gray-700">
										{awayTeam.name}
									</span>
								</div>
							</div>

							{/* Single combined bar */}
							<div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden relative">
								{/* Home Team (Left - Green) */}
								<div
									className="bg-green-600 h-full flex items-center justify-start pl-3 transition-all duration-500 absolute left-0 top-0"
									style={{
										width: `${homeTeamProb !== null ? homeTeamProb : 0}%`,
									}}
								>
									{homeTeamProb !== null && homeTeamProb > 8 && (
										<span className="text-xs font-medium text-white">
											{homeTeamProb.toFixed(1)}%
										</span>
									)}
								</div>

								{/* Away Team (Right - Blue) */}
								<div
									className="bg-blue-600 h-full flex items-center justify-end pr-3 transition-all duration-500 absolute top-0"
									style={{
										left: `${homeTeamProb !== null ? homeTeamProb : 0}%`,
										width: `${awayTeamProb !== null ? awayTeamProb : 0}%`,
									}}
								>
									{awayTeamProb !== null && awayTeamProb > 8 && (
										<span className="text-xs font-medium text-white">
											{awayTeamProb.toFixed(1)}%
										</span>
									)}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Main Content: Combined Table */}
				<div className="bg-white rounded-lg shadow-md p-6">
					{/* Player Images and Info Header */}
					<div className="grid grid-cols-3 gap-4 sm:gap-6 mb-6">
						{/* Home Team */}
						<div className="flex flex-col items-center">
							<div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center mb-4">
								{!homeTeam.hash_image ||
								homeTeam.hash_image ===
									'https://www.tennisexplorer.com/res/img/default-avatar.jpg' ||
								homeImageError ? (
									<User className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
								) : (
									<img
										src={homeTeam.hash_image}
										alt={homeTeam.name}
										className="w-full h-full object-cover"
										onError={() => setHomeImageError(true)}
									/>
								)}
							</div>
							<h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 text-center">
								{homeTeam.name}
							</h3>
						</div>

						{/* VS Divider */}
						<div className="flex items-center justify-center">
							<span className="text-xl sm:text-2xl font-bold text-gray-400">
								VS
							</span>
						</div>

						{/* Away Team */}
						<div className="flex flex-col items-center">
							<div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center mb-4">
								{!awayTeam.hash_image ||
								awayTeam.hash_image ===
									'https://www.tennisexplorer.com/res/img/default-avatar.jpg' ||
								awayImageError ? (
									<User className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
								) : (
									<img
										src={awayTeam.hash_image}
										alt={awayTeam.name}
										className="w-full h-full object-cover"
										onError={() => setAwayImageError(true)}
									/>
								)}
							</div>
							<h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 text-center">
								{awayTeam.name}
							</h3>
						</div>
					</div>

					{/* Combined Player Details Table */}
					<div className="overflow-x-auto rounded-lg overflow-hidden">
						<table className="min-w-full">
							<tbody>
								{homeDetails.map((detail, index) => {
									const isLastRow =
										index === homeDetails.length - 1 &&
										!(match.home_team_odds || match.away_team_odds)
									const isFirstRow = index === 0
									return (
										<tr
											key={index}
											className={
												index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'
											}
										>
											<td
												className={`px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center w-1/3 ${
													isFirstRow ? 'rounded-tl-lg' : ''
												} ${isLastRow ? 'rounded-bl-lg' : ''}`}
											>
												{homeDetails[index]?.value || '-'}
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-center w-1/3">
												{detail.label}
											</td>
											<td
												className={`px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center w-1/3 ${
													isFirstRow ? 'rounded-tr-lg' : ''
												} ${isLastRow ? 'rounded-br-lg' : ''}`}
											>
												{awayDetails[index]?.value || '-'}
											</td>
										</tr>
									)
								})}
								{/* Betting Odds Row */}
								{(match.home_team_odds || match.away_team_odds) && (
									<tr className="bg-gray-100">
										<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center w-1/3 rounded-bl-lg">
											{match.home_team_odds ? (
												<span className="text-sm text-gray-600">
													{formatOdds(match.home_team_odds)}
												</span>
											) : (
												'-'
											)}
										</td>
										<td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-center w-1/3">
											Betting Odds
										</td>
										<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center w-1/3 rounded-br-lg">
											{match.away_team_odds ? (
												<span className="text-sm text-gray-600">
													{formatOdds(match.away_team_odds)}
												</span>
											) : (
												'-'
											)}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	)
}

export default MatchPage
