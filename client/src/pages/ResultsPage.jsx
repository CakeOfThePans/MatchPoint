import React, { useState } from 'react'
import { CheckCircle, Search, XCircle } from 'lucide-react'
import { MatchCard } from '../components/MatchCard'
import { pastMatches, modelPerformance, getPlayerById } from '../utils/mockData'
import TournamentSelect from '../components/TournamentSelect'

export const ResultsPage = () => {
	const [activeTab, setActiveTab] = useState('performance')
	const [selectedTournament, setSelectedTournament] = useState(null)
	const [searchQuery, setSearchQuery] = useState('')
	// Calculate correct vs incorrect predictions
	const correctPredictions = pastMatches.filter(
		(match) => match.prediction.accurate
	).length
	const incorrectPredictions = pastMatches.length - correctPredictions

	// Filter matches based on selected tournament and search query
	const filteredMatches = pastMatches.filter((match) => {
		if (selectedTournament && match.tournamentId !== selectedTournament) {
			return false
		}
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
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Model Results</h1>
				<p className="text-gray-500 mb-8">
					Track our prediction model's performance and view past match results
				</p>
				{/* Tabs */}
				<div className="border-b border-gray-200 mb-8">
					<nav className="-mb-px flex space-x-8" aria-label="Tabs">
						<button
							className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none ${
								activeTab === 'performance'
									? 'border-green-600 text-green-600'
									: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
							}`}
							onClick={() => setActiveTab('performance')}
						>
							Model Performance
						</button>
						<button
							className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none ${
								activeTab === 'pastMatches'
									? 'border-green-600 text-green-600'
									: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
							}`}
							onClick={() => setActiveTab('pastMatches')}
						>
							Past Match Results
						</button>
					</nav>
				</div>
				{/* Tournament select and search bar, only for pastMatches tab */}
				{activeTab === 'pastMatches' && (
					<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
						<div className="md:w-64">
							<TournamentSelect
								onSelect={setSelectedTournament}
								selectedId={selectedTournament}
							/>
						</div>
						<div className="flex-1">
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
					</div>
				)}
				{/* Performance Tab */}
				{activeTab === 'performance' && (
					<div className="space-y-8">
						{/* Overall performance card */}
						<div className="bg-white rounded-lg shadow-md p-6">
							<h2 className="text-xl font-semibold mb-4">
								Overall Performance
							</h2>
							<div className="grid gap-6 md:grid-cols-2 justify-items-center">
								<div className="bg-green-50 rounded-lg p-4 text-center w-full">
									<div className="text-4xl font-bold text-green-600">
										{modelPerformance.overallAccuracy}%
									</div>
									<p className="text-gray-600 mt-1">Overall Accuracy</p>
								</div>
								<div className="bg-green-50 rounded-lg p-4 flex items-center justify-center w-full">
									<div className="flex items-center mx-auto">
										<CheckCircle className="h-6 w-6 text-green-600 mr-2" />
										<div>
											<div className="text-2xl font-bold">
												{correctPredictions}
											</div>
											<p className="text-gray-600 text-sm">Correct</p>
										</div>
									</div>
									<div className="mx-4 text-gray-300 text-2xl">|</div>
									<div className="flex items-center mx-auto">
										<XCircle className="h-6 w-6 text-red-500 mr-2" />
										<div>
											<div className="text-2xl font-bold">
												{incorrectPredictions}
											</div>
											<p className="text-gray-600 text-sm">Incorrect</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						{/* Surface accuracy */}
						<div className="bg-white rounded-lg shadow-md p-6">
							<h2 className="text-xl font-semibold mb-4">Surface Accuracy</h2>
							<div className="grid gap-4 md:grid-cols-3">
								<div>
									<div className="flex justify-between mb-1">
										<span className="text-sm font-medium">Hard</span>
										<span className="text-sm font-medium text-gray-500">
											{modelPerformance.surfaceAccuracy.hard}%
										</span>
									</div>
									<div className="w-full h-3 bg-gray-200 rounded-full">
										<div
											className="h-full bg-blue-500 rounded-full"
											style={{
												width: `${modelPerformance.surfaceAccuracy.hard}%`,
											}}
										/>
									</div>
								</div>
								<div>
									<div className="flex justify-between mb-1">
										<span className="text-sm font-medium">Clay</span>
										<span className="text-sm font-medium text-gray-500">
											{modelPerformance.surfaceAccuracy.clay}%
										</span>
									</div>
									<div className="w-full h-3 bg-gray-200 rounded-full">
										<div
											className="h-full bg-orange-500 rounded-full"
											style={{
												width: `${modelPerformance.surfaceAccuracy.clay}%`,
											}}
										/>
									</div>
								</div>
								<div>
									<div className="flex justify-between mb-1">
										<span className="text-sm font-medium">Grass</span>
										<span className="text-sm font-medium text-gray-500">
											{modelPerformance.surfaceAccuracy.grass}%
										</span>
									</div>
									<div className="w-full h-3 bg-gray-200 rounded-full">
										<div
											className="h-full bg-green-500 rounded-full"
											style={{
												width: `${modelPerformance.surfaceAccuracy.grass}%`,
											}}
										/>
									</div>
								</div>
							</div>
						</div>
						{/* Tournament accuracy */}
						<div className="bg-white rounded-lg shadow-md p-6">
							<h2 className="text-xl font-semibold mb-4">
								Tournament Accuracy
							</h2>
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<div className="flex justify-between mb-1">
										<span className="text-sm font-medium">Grand Slam</span>
										<span className="text-sm font-medium text-gray-500">
											{modelPerformance.tournamentAccuracy['Grand Slam']}%
										</span>
									</div>
									<div className="w-full h-3 bg-gray-200 rounded-full">
										<div
											className="h-full bg-purple-500 rounded-full"
											style={{
												width: `${modelPerformance.tournamentAccuracy['Grand Slam']}%`,
											}}
										/>
									</div>
								</div>
								<div>
									<div className="flex justify-between mb-1">
										<span className="text-sm font-medium">Masters 1000</span>
										<span className="text-sm font-medium text-gray-500">
											{modelPerformance.tournamentAccuracy['Masters 1000']}%
										</span>
									</div>
									<div className="w-full h-3 bg-gray-200 rounded-full">
										<div
											className="h-full bg-pink-500 rounded-full"
											style={{
												width: `${modelPerformance.tournamentAccuracy['Masters 1000']}%`,
											}}
										/>
									</div>
								</div>
								<div>
									<div className="flex justify-between mb-1">
										<span className="text-sm font-medium">ATP 500</span>
										<span className="text-sm font-medium text-gray-500">
											{modelPerformance.tournamentAccuracy['ATP 500']}%
										</span>
									</div>
									<div className="w-full h-3 bg-gray-200 rounded-full">
										<div
											className="h-full bg-indigo-500 rounded-full"
											style={{
												width: `${modelPerformance.tournamentAccuracy['ATP 500']}%`,
											}}
										/>
									</div>
								</div>
								<div>
									<div className="flex justify-between mb-1">
										<span className="text-sm font-medium">ATP 250</span>
										<span className="text-sm font-medium text-gray-500">
											{modelPerformance.tournamentAccuracy['ATP 250']}%
										</span>
									</div>
									<div className="w-full h-3 bg-gray-200 rounded-full">
										<div
											className="h-full bg-yellow-500 rounded-full"
											style={{
												width: `${modelPerformance.tournamentAccuracy['ATP 250']}%`,
											}}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
				{/* Past Matches Tab */}
				{activeTab === 'pastMatches' && (
					<div>
						{/* Filtered past matches */}
						{filteredMatches.length > 0 ? (
							<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
								{filteredMatches.map((match) => (
									<MatchCard key={match.id} match={match} isPast />
								))}
							</div>
						) : (
							<div className="text-center py-12">
								<p className="text-gray-500">
									No matches found for your search criteria.
								</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	)
}

export default ResultsPage
