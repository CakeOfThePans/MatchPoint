import React from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { pastMatches, modelPerformance } from '../utils/mockData'

export const ResultsPage = () => {
	// Calculate correct vs incorrect predictions
	const correctPredictions = pastMatches.filter(
		(match) => match.prediction.accurate
	).length
	const incorrectPredictions = pastMatches.length - correctPredictions

	return (
		<div className="bg-gray-50 min-h-screen w-full">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Model Results</h1>
				<p className="text-gray-500 mb-8">
					Track our prediction model's performance and view past match results
				</p>

				<div className="space-y-8">
					{/* Overall performance card */}
					<div className="bg-white rounded-lg shadow-md p-6">
						<h2 className="text-xl font-semibold mb-4">Overall Performance</h2>
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
						<h2 className="text-xl font-semibold mb-4">Tournament Accuracy</h2>
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
			</div>
		</div>
	)
}

export default ResultsPage
