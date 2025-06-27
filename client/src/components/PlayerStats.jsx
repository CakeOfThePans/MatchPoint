import React from 'react'
import { TrophyIcon, AwardIcon, CalendarIcon, PercentIcon } from 'lucide-react'
const PlayerStats = ({ player }) => {
  const surfaceColors = {
    hard: 'bg-blue-600',
    clay: 'bg-orange-600',
    grass: 'bg-green-600',
  }
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center space-x-4">
          <img
            src={player.image}
            alt={player.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-white"
          />
          <div>
            <h2 className="text-xl font-bold text-white">{player.name}</h2>
            <div className="text-blue-100">
              {player.country} • World Rank {player.rank}
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center text-gray-500 mb-1">
              <TrophyIcon className="h-4 w-4 mr-1" />
              <span className="text-sm">Titles</span>
            </div>
            <div className="text-2xl font-bold">{player.stats.titles}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center text-gray-500 mb-1">
              <AwardIcon className="h-4 w-4 mr-1" />
              <span className="text-sm">Grand Slams</span>
            </div>
            <div className="text-2xl font-bold">{player.stats.grandSlams}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center text-gray-500 mb-1">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span className="text-sm">Years Pro</span>
            </div>
            <div className="text-2xl font-bold">{player.stats.yearsPlayed}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center text-gray-500 mb-1">
              <PercentIcon className="h-4 w-4 mr-1" />
              <span className="text-sm">Win Rate</span>
            </div>
            <div className="text-2xl font-bold">
              {Math.round(player.stats.winLossRatio * 100)}%
            </div>
          </div>
        </div>
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Surface Win Rates</h3>
          <div className="space-y-4">
            {Object.entries(player.stats.surfaceWinRate).map(
              ([surface, rate]) => (
                <div key={surface} className="flex items-center">
                  <div className="w-24 text-sm capitalize">{surface}</div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${surfaceColors[surface]} rounded-full`}
                        style={{
                          width: `${Math.round(rate * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm font-medium">
                    {Math.round(rate * 100)}%
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">
            Recent Tournament Results
          </h3>
          <div className="space-y-3">
            {player.stats.recentForm.map((tournament, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
              >
                <div className="text-sm font-medium">
                  {tournament.tournament}
                </div>
                <div className="text-sm text-gray-600">{tournament.result}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">Year-End Rankings</h3>
          <div className="flex items-end space-x-4 h-32">
            {player.stats.yearlyRanking.map((year, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{
                    height: `${Math.max(10, 100 - year.rank * 2)}%`,
                    minHeight: '20px',
                  }}
                ></div>
                <div className="text-xs mt-2">{year.year}</div>
                <div className="text-xs text-gray-500">#{year.rank}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
export default PlayerStats
