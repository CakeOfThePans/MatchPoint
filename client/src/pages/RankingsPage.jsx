import React, { useState } from 'react'
import { SearchIcon } from 'lucide-react'
import { players } from '../utils/mockData'

const RankingsPage = () => {
	const [searchTerm, setSearchTerm] = useState('')

	const filteredPlayers = players.filter(
		(player) =>
			player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			player.country.toLowerCase().includes(searchTerm.toLowerCase())
	)

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-800 mb-2">
					Live ATP Rankings
				</h1>
				<p className="text-gray-600">
					View the latest live ATP rankings in real time.
				</p>
			</div>

			<div className="mb-6">
				<div className="relative max-w-md">
					<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
					<input
						type="text"
						className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
						placeholder="Search players..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow-md overflow-hidden">
				<div className="px-6 py-4 border-b border-gray-200">
					<h2 className="text-lg font-semibold text-gray-800">ATP Rankings</h2>
				</div>
				<div className="divide-y divide-gray-200">
					{filteredPlayers.map((player, index) => (
						<div
							key={player.id}
							className="flex items-center space-x-4 p-4 hover:bg-gray-50"
						>
							<div className="flex-shrink-0 w-8 text-center">
								<span className="text-lg font-bold text-gray-900">
									{player.rank}
								</span>
							</div>
							<div className="flex-shrink-0">
								<img
									src={player.image}
									alt={player.name}
									className="w-12 h-12 rounded-full object-cover"
								/>
							</div>
							<div className="flex-1 min-w-0">
								<div className="font-medium text-gray-900 truncate">
									{player.name}
								</div>
								<div className="text-sm text-gray-500">{player.country}</div>
							</div>
							<div className="flex-shrink-0 text-right">
								<div className="text-sm font-medium text-gray-900">
									{player.points || 'N/A'} pts
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default RankingsPage
