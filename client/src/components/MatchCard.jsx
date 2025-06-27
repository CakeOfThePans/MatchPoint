import React from 'react'
import { Calendar, Clock } from 'lucide-react'
import { getPlayerById, getTournamentById } from '../utils/mockData'
export const MatchCard = ({ match, isPast = false }) => {
	const player1 = getPlayerById(match.player1Id)
	const player2 = getPlayerById(match.player2Id)
	const tournament = getTournamentById(match.tournamentId)
	if (!player1 || !player2 || !tournament) return null
	const date = isPast ? new Date(match.date) : new Date(match.scheduledTime)
	const formattedDate = date.toLocaleDateString('en-US', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	})
	const formattedTime = !isPast
		? date.toLocaleTimeString('en-US', {
				hour: '2-digit',
				minute: '2-digit',
		  })
		: null
	return (
		<div className="bg-white rounded-lg shadow-md overflow-hidden">
			<div className="bg-green-50 px-4 py-2 border-b border-gray-200">
				<div className="flex justify-between items-center">
					<div>
						<h3 className="font-medium text-green-800">{tournament.name}</h3>
						<p className="text-sm text-gray-600">{match.round}</p>
					</div>
					<div className="text-sm text-gray-600 flex items-center">
						<Calendar className="h-4 w-4 mr-1" />
						{formattedDate}
						{formattedTime && (
							<>
								<Clock className="h-4 w-4 ml-3 mr-1" />
								{formattedTime}
							</>
						)}
					</div>
				</div>
			</div>
			<div className="p-4">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center">
						<div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
							<img
								src={player1.image}
								alt={player1.name}
								className="w-full h-full object-cover"
							/>
						</div>
						<div className="ml-3">
							<p className="font-medium">{player1.name}</p>
							<p className="text-sm text-gray-600">Rank {player1.rank}</p>
						</div>
					</div>
					<div className="text-center px-3 py-1 bg-green-100 rounded-full text-sm font-medium text-green-800">
						{match.prediction.player1Chance}%
					</div>
				</div>
				<div className="flex items-center justify-between">
					<div className="flex items-center">
						<div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
							<img
								src={player2.image}
								alt={player2.name}
								className="w-full h-full object-cover"
							/>
						</div>
						<div className="ml-3">
							<p className="font-medium">{player2.name}</p>
							<p className="text-sm text-gray-600">Rank {player2.rank}</p>
						</div>
					</div>
					<div className="text-center px-3 py-1 bg-green-100 rounded-full text-sm font-medium text-green-800">
						{match.prediction.player2Chance}%
					</div>
				</div>
				<div className="mt-4 pt-3 border-t border-gray-200">
					<div className="flex items-center justify-between">
						<p className="text-sm font-medium">
							Surface:{' '}
							<span className="font-medium text-gray-600">
								{tournament.surface}
							</span>
						</p>
						{isPast && (
							<span
								className={`px-2 py-0.5 rounded-full text-xs font-semibold align-middle ${
									match.prediction.accurate
										? 'bg-green-100 text-green-700'
										: 'bg-red-100 text-red-700'
								}`}
							>
								{match.prediction.accurate ? 'Correct' : 'Incorrect'}
							</span>
						)}
					</div>
					{isPast && (
						<>
							<p className="text-sm font-medium">
								Result: <span className="text-gray-600">{match.score}</span>
							</p>
							<p className="text-sm font-medium">
								Winner:{' '}
								<span className="text-gray-600">
									{match.winner === player1.id ? player1.name : player2.name}
								</span>
							</p>
						</>
					)}
				</div>
			</div>
		</div>
	)
}

export default MatchCard
