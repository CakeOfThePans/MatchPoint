import React, { useState } from 'react'
import { Search, Calendar } from 'lucide-react'
import MatchCard from '../components/MatchCard'
import TournamentSelect from '../components/TournamentSelect'
import { upcomingMatches, getPlayerById } from '../utils/mockData'
export const PredictionsPage = () => {
	const [selectedTournament, setSelectedTournament] = useState(null)
	const [searchQuery, setSearchQuery] = useState('')
	// Filter matches based on selected tournament and search query
	const filteredMatches = upcomingMatches.filter((match) => {
		// Tournament filter
		if (selectedTournament && match.tournamentId !== selectedTournament) {
			return false
		}
		// Search filter (player names)
		if (searchQuery) {
			const player1 = getPlayerById(match.player1Id)
			const player2 = getPlayerById(match.player2Id)
			const searchLower = searchQuery.toLowerCase()
			if (player1 && player2) {
				return (
					player1.name.toLowerCase().includes(searchLower) ||
					player2.name.toLowerCase().includes(searchLower)
				)
			}
			return false
		}
		return true
	})
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
					<div className="relative rounded-md shadow-sm">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Search className="h-5 w-5 text-gray-400" />
						</div>
						<input
							type="text"
							className="block w-full pl-10 pr-12 sm:text-sm border border-gray-300 rounded-md py-3 focus:outline-none focus:border-blue-500"
							placeholder="Search by player name..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>
				{/* Group matches by date */}
				<div className="space-y-8">
					{filteredMatches.length > 0 ? (
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
										<MatchCard key={match.id} match={match} />
									))}
								</div>
							</div>
						))
					) : (
						<div className="text-center py-12">
							<p className="text-gray-500">
								No matches found for your search criteria.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
// Helper function to group matches by date
function groupMatchesByDate(matches) {
	const grouped = matches.reduce((acc, match) => {
		const date = new Date(match.scheduledTime)
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
	// Sort groups by date
	return grouped.sort((a, b) => {
		const dateA = new Date(a.matches[0].scheduledTime)
		const dateB = new Date(b.matches[0].scheduledTime)
		return dateA.getTime() - dateB.getTime()
	})
}

export default PredictionsPage


// TODO: Maybe add a favorited matches section + button to filter between upcoming and favorite matches