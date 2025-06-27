import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import PredictionBar from '../components/PredictionBar'
import PlayerSelect from '../components/PlayerSelect'
import { players } from '../utils/mockData'
export const HeadToHeadPage = () => {
	const [player1, setPlayer1] = useState(null)
	const [player2, setPlayer2] = useState(null)
	const [surface, setSurface] = useState('all')
	const [isCalculating, setIsCalculating] = useState(false)
	const [predictionResult, setPredictionResult] = useState(null)
	const [surfaceDropdownOpen, setSurfaceDropdownOpen] = useState(false)
	const surfaceDropdownRef = useRef(null)

	const surfaces = [
		{
			id: 'all',
			name: 'All Surfaces',
		},
		{
			id: 'hard',
			name: 'Hard Court',
		},
		{
			id: 'clay',
			name: 'Clay Court',
		},
		{
			id: 'grass',
			name: 'Grass Court',
		},
	]

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				surfaceDropdownRef.current &&
				!surfaceDropdownRef.current.contains(event.target)
			) {
				setSurfaceDropdownOpen(false)
			}
		}
		if (surfaceDropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		} else {
			document.removeEventListener('mousedown', handleClickOutside)
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [surfaceDropdownOpen])

	const handleCalculate = () => {
		if (!player1 || !player2) return
		setIsCalculating(true)
		// Simulate API call with timeout
		setTimeout(() => {
			// Generate mock prediction based on players and surface
			const selectedPlayer1 = players.find((p) => p.id === player1)
			const selectedPlayer2 = players.find((p) => p.id === player2)
			if (selectedPlayer1 && selectedPlayer2) {
				// Generate somewhat realistic prediction based on player ranks
				const rankDiff = Math.abs(selectedPlayer1.rank - selectedPlayer2.rank)
				const isFavorite = selectedPlayer1.rank < selectedPlayer2.rank
				let player1Chance = 50
				if (rankDiff > 0) {
					// Adjust chance based on rank difference (max 30% advantage for much higher rank)
					const advantage = Math.min(30, rankDiff * 3)
					player1Chance = isFavorite ? 50 + advantage : 50 - advantage
					// Surface adjustment
					if (surface === 'clay' && selectedPlayer1.country === 'Spain') {
						player1Chance += 5 // Spanish players tend to do better on clay
					} else if (surface === 'grass' && selectedPlayer1.country === 'UK') {
						player1Chance += 5 // UK players tend to do better on grass
					}
					// Ensure within bounds
					player1Chance = Math.min(Math.max(player1Chance, 20), 80)
				}
				const player2Chance = 100 - player1Chance
				const confidenceScore = 65 + Math.floor(Math.random() * 20)
				setPredictionResult({
					player1: {
						...selectedPlayer1,
						chance: player1Chance,
					},
					player2: {
						...selectedPlayer2,
						chance: player2Chance,
					},
					confidenceScore,
					surface,
					h2hRecord: {
						player1Wins: Math.floor(Math.random() * 10),
						player2Wins: Math.floor(Math.random() * 10),
					},
				})
			}
			setIsCalculating(false)
		}, 1500)
	}

	return (
		<div className="bg-gray-50 min-h-screen w-full">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					Head-to-Head Prediction
				</h1>
				<p className="text-gray-500 mb-8">
					Compare any two players and get a detailed match prediction
				</p>
				<div className="bg-white rounded-lg shadow-md p-6 mb-8">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{/* Player 1 Selection */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Player 1
							</label>
							<PlayerSelect
								selectedPlayer={player1}
								onSelect={setPlayer1}
								placeholder="Select first player"
							/>
						</div>
						{/* Player 2 Selection */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Player 2
							</label>
							<PlayerSelect
								selectedPlayer={player2}
								onSelect={setPlayer2}
								placeholder="Select second player"
							/>
						</div>
						{/* Surface Selection */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Surface
							</label>
							<div className="relative w-full" ref={surfaceDropdownRef}>
								<button
									type="button"
									className="flex items-center justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
									onClick={() => setSurfaceDropdownOpen((open) => !open)}
								>
									<span>
										{surfaces.find((s) => s.id === surface)?.name ||
											'Select Surface'}
									</span>
									<ChevronDown className="ml-2 h-4 w-4" />
								</button>
								{surfaceDropdownOpen && (
									<div className="absolute z-20 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg py-1">
										{surfaces.map((s, idx) => (
											<div
												key={s.id}
												className={`cursor-pointer px-4 py-2 rounded-md hover:bg-green-50 ${
													idx === surfaces.length - 1
														? ''
														: 'border-b border-gray-100'
												} ${surface === s.id ? 'bg-green-100' : ''}`}
												onClick={() => {
													setSurface(s.id)
													setSurfaceDropdownOpen(false)
												}}
											>
												<span className="font-medium">{s.name}</span>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
					<div className="mt-6 flex justify-center">
						<button
							className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
							onClick={handleCalculate}
							disabled={!player1 || !player2 || isCalculating}
						>
							{isCalculating ? (
								<>
									<svg
										className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Calculating...
								</>
							) : (
								'Calculate Prediction'
							)}
						</button>
					</div>
				</div>
				{/* Prediction Results */}
				{predictionResult && (
					<div className="bg-white rounded-lg shadow-md p-6">
						<h2 className="text-xl font-semibold mb-6 text-center">
							Match Prediction Results
						</h2>
						<div className="flex flex-col md:flex-row justify-between items-center mb-8">
							<div className="text-center mb-4 md:mb-0">
								<div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 mx-auto mb-2">
									<img
										src={predictionResult.player1.image}
										alt={predictionResult.player1.name}
										className="w-full h-full object-cover"
									/>
								</div>
								<p className="font-medium">{predictionResult.player1.name}</p>
								<p className="text-sm text-gray-600">
									Rank {predictionResult.player1.rank}
								</p>
							</div>
							<div className="flex items-center justify-center text-2xl font-bold text-gray-400 mb-4 md:mb-0">
								VS
							</div>
							<div className="text-center">
								<div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 mx-auto mb-2">
									<img
										src={predictionResult.player2.image}
										alt={predictionResult.player2.name}
										className="w-full h-full object-cover"
									/>
								</div>
								<p className="font-medium">{predictionResult.player2.name}</p>
								<p className="text-sm text-gray-600">
									Rank {predictionResult.player2.rank}
								</p>
							</div>
						</div>
						<div className="mb-8">
							<h3 className="text-lg font-medium mb-3 text-center">
								Win Probability
							</h3>
							<PredictionBar
								player1={{
									id: predictionResult.player1.id,
									name: predictionResult.player1.name,
									chance: predictionResult.player1.chance,
								}}
								player2={{
									id: predictionResult.player2.id,
									name: predictionResult.player2.name,
									chance: predictionResult.player2.chance,
								}}
								confidenceScore={predictionResult.confidenceScore}
							/>
						</div>
						<div className="grid md:grid-cols-2 gap-6">
							<div className="bg-gray-50 p-4 rounded-md">
								<h3 className="font-medium mb-3 flex items-center">
									<div className="h-4 w-4 mr-2 text-green-600" />
									Head to Head Record
								</h3>
								<div className="flex justify-between items-center">
									<div className="text-center">
										<p className="text-2xl font-bold text-green-600">
											{predictionResult.h2hRecord.player1Wins}
										</p>
										<p className="text-sm text-gray-500">
											{predictionResult.player1.name}
										</p>
									</div>
									<div className="text-lg font-medium text-gray-400">-</div>
									<div className="text-center">
										<p className="text-2xl font-bold text-green-600">
											{predictionResult.h2hRecord.player2Wins}
										</p>
										<p className="text-sm text-gray-500">
											{predictionResult.player2.name}
										</p>
									</div>
								</div>
							</div>
							<div className="bg-gray-50 p-4 rounded-md">
								<h3 className="font-medium mb-3">Surface Analysis</h3>
								<p className="text-sm text-gray-600 mb-2">
									Surface:{' '}
									<span className="font-medium">
										{
											surfaces.find((s) => s.id === predictionResult.surface)
												?.name
										}
									</span>
								</p>
								<p className="text-sm text-gray-600">
									{predictionResult.player1.chance >
									predictionResult.player2.chance ? (
										<>
											<span className="font-medium">
												{predictionResult.player1.name}
											</span>{' '}
											has a{' '}
											{predictionResult.player1.chance -
												predictionResult.player2.chance}
											% advantage on this surface.
										</>
									) : predictionResult.player2.chance >
									  predictionResult.player1.chance ? (
										<>
											<span className="font-medium">
												{predictionResult.player2.name}
											</span>{' '}
											has a{' '}
											{predictionResult.player2.chance -
												predictionResult.player1.chance}
											% advantage on this surface.
										</>
									) : (
										<>Both players are evenly matched on this surface.</>
									)}
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
// const PlayerSelect = ({
//   value,
//   onChange,
//   players,
//   placeholder,
// }) => {
//   const [isOpen, setIsOpen] = useState(false)
//   const selectedPlayer = players.find((p) => p.id === value)
//   return (
//     <div className="relative">
//       <button
//         type="button"
//         className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         {selectedPlayer ? (
//           <div className="flex items-center">
//             <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 mr-2">
//               <img
//                 src={selectedPlayer.image}
//                 alt={selectedPlayer.name}
//                 className="w-full h-full object-cover"
//               />
//             </div>
//             <span className="block truncate">{selectedPlayer.name}</span>
//           </div>
//         ) : (
//           <span className="block truncate text-gray-500">{placeholder}</span>
//         )}
//         <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
//           <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
//         </span>
//       </button>
//       {isOpen && (
//         <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
//           {players.map((player) => (
//             <div
//               key={player.id}
//               className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
//               onClick={() => {
//                 onChange(player.id)
//                 setIsOpen(false)
//               }}
//             >
//               <div className="flex items-center">
//                 <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 mr-2">
//                   <img
//                     src={player.image}
//                     alt={player.name}
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//                 <span
//                   className={`block truncate ${value === player.id ? 'font-medium' : 'font-normal'}`}
//                 >
//                   {player.name}
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

export default HeadToHeadPage
