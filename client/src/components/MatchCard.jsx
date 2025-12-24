import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, User, Info } from 'lucide-react'
import Tooltip from './Tooltip'
import { formatDate, formatTime } from '../utils/dateHelpers'
import {
	formatProbability,
	getProbabilityColor,
} from '../utils/probabilityHelpers'
import { getModelInfo } from '../utils/matchHelpers'

export const MatchCard = ({ match, isPast = false }) => {
	const navigate = useNavigate()
	const [homeImageError, setHomeImageError] = useState(false)
	const [awayImageError, setAwayImageError] = useState(false)

	// Extract data from backend structure
	const homeTeam = match.home_team
	const awayTeam = match.away_team
	const tournament = match.tournament

	if (!homeTeam || !awayTeam || !tournament) return null

	const formattedDate = formatDate(match.start_time, {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	})
	const formattedTime = formatTime(match.start_time)

	// Calculate prediction percentages if available
	const homeTeamProb = match.home_team_prediction_prob
	const awayTeamProb = match.away_team_prediction_prob

	// Get model info for tooltip
	const modelInfo = getModelInfo(match)

	const handleCardClick = () => {
		navigate(`/match/${match.match_id}`)
	}

	return (
		<div
			className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
			onClick={handleCardClick}
		>
			<div className="bg-green-50 px-4 py-2 border-b border-gray-200">
				<div className="flex flex-col space-y-1">
					<div className="flex justify-between items-center">
						<h3 className="font-medium text-green-800 text-sm">
							{tournament.tournament_name}
						</h3>
						<div className="flex items-center text-sm text-gray-600">
							<Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
							<span>{formattedDate}</span>
							<Clock className="h-4 w-4 ml-3 mr-1 flex-shrink-0" />
							<span>{formattedTime}</span>
						</div>
					</div>
					<div className="flex items-center justify-between">
						<p className="text-sm text-gray-600 truncate">{match.name}</p>
						{modelInfo && (
							<Tooltip
								content={`This match was predicted using the ${modelInfo.label} model, which uses the following features: ${modelInfo.desc}`}
							>
								<Info className="h-4 w-4 text-gray-400 flex-shrink-0" />
							</Tooltip>
						)}
					</div>
				</div>
			</div>
			<div className="p-4">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center">
						<div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
							{!homeTeam.hash_image ||
							homeTeam.hash_image ===
								'https://www.tennisexplorer.com/res/img/default-avatar.jpg' ||
							homeImageError ? (
								<User className="h-6 w-6 text-gray-400" />
							) : (
								<img
									src={homeTeam.hash_image}
									alt={homeTeam.name}
									className="w-full h-full object-cover"
									onError={() => setHomeImageError(true)}
								/>
							)}
						</div>
						<div className="ml-3">
							<p className="font-medium">{homeTeam.name}</p>
							{!isPast && homeTeam.rank && (
								<p className="text-sm text-gray-600">Rank {homeTeam.rank}</p>
							)}
						</div>
					</div>
					<div
						className={`text-center px-3 py-1 rounded-full text-sm font-medium ${getProbabilityColor(
							homeTeamProb
						)}`}
					>
						{formatProbability(homeTeamProb)}
					</div>
				</div>
				<div className="flex items-center justify-between">
					<div className="flex items-center">
						<div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
							{!awayTeam.hash_image ||
							awayTeam.hash_image ===
								'https://www.tennisexplorer.com/res/img/default-avatar.jpg' ||
							awayImageError ? (
								<User className="h-6 w-6 text-gray-400" />
							) : (
								<img
									src={awayTeam.hash_image}
									alt={awayTeam.name}
									className="w-full h-full object-cover"
									onError={() => setAwayImageError(true)}
								/>
							)}
						</div>
						<div className="ml-3">
							<p className="font-medium">{awayTeam.name}</p>
							{!isPast && awayTeam.rank && (
								<p className="text-sm text-gray-600">Rank {awayTeam.rank}</p>
							)}
						</div>
					</div>
					<div
						className={`text-center px-3 py-1 rounded-full text-sm font-medium ${getProbabilityColor(
							awayTeamProb
						)}`}
					>
						{formatProbability(awayTeamProb)}
					</div>
				</div>
				<div className="mt-4 pt-3 border-t border-gray-200">
					<div className="flex items-center justify-between">
						<p className="text-sm font-medium">
							Surface:{' '}
							<span className="font-medium text-gray-600">
								{tournament.surface_type}
							</span>
						</p>
						{match.winner_id &&
							match.winner_prediction_id && ( // If the match has a winner and a prediction, show it
								<span
									className={`px-2 py-0.5 rounded-full text-xs font-semibold align-middle ${
										match.winner_id === match.winner_prediction_id
											? 'bg-green-100 text-green-700'
											: 'bg-red-100 text-red-700'
									}`}
								>
									{match.winner_id === match.winner_prediction_id
										? 'Correct'
										: 'Incorrect'}
								</span>
							)}
					</div>
					{match.winner_id && ( // If the match has a winner, show the winner
						<p className="text-sm font-medium">
							Winner: <span className="text-gray-600">{match.winner_name}</span>
						</p>
					)}
				</div>
			</div>
		</div>
	)
}

export default MatchCard
