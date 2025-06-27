import React, { useState } from 'react'
import { SearchIcon } from 'lucide-react'
import PlayerStats from '../components/PlayerStats'
import { players } from '../utils/mockData'

const PlayerStatsPage = () => {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedPlayer, setSelectedPlayer] = useState(players[0])

	const filteredPlayers = players.filter(
		(player) =>
			player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			player.country.toLowerCase().includes(searchTerm.toLowerCase())
	)

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-800 mb-2">
					Player Statistics
				</h1>
				<p className="text-gray-600">
					View detailed statistics and performance metrics for tennis players.
				</p>
			</div>

			<div className="flex flex-col md:flex-row gap-8">
				<div className="md:w-64">
					<div className="relative mb-4">
						<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
						<input
							type="text"
							className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
							placeholder="Search players..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<div className="bg-white rounded-lg shadow-md">
						{filteredPlayers.map((player) => (
							<div
								key={player.id}
								className={`
                  flex items-center space-x-3 p-3 cursor-pointer
                  ${
										selectedPlayer.id === player.id
											? 'bg-green-50'
											: 'hover:bg-gray-50'
									}
                  ${
										filteredPlayers.length > 1 ? 'border-b border-gray-300' : ''
									}
                `}
								onClick={() => setSelectedPlayer(player)}
							>
								<img
									src={player.image}
									alt={player.name}
									className="w-10 h-10 rounded-full object-cover"
								/>
								<div>
									<div className="font-medium">{player.name}</div>
									<div className="text-sm text-gray-500">
										{player.country} • Rank {player.rank}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
				<div className="flex-1">
					<PlayerStats player={selectedPlayer} />
				</div>
			</div>
		</div>
	)
}

export default PlayerStatsPage
