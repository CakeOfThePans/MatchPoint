import React from 'react'
import { Link } from 'react-router-dom'
import { BarChart2Icon, HistoryIcon, UserIcon } from 'lucide-react'

const HomePage = () => {
	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	return (
		<div className="w-full">
			{/* Hero section with full-width background */}
			<div className="bg-gradient-to-r from-green-600 to-green-700 w-full py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="max-w-3xl mx-auto text-center">
						<h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
							Predict Tennis Matches with AI Precision
						</h1>
						<p className="text-green-100 text-lg mb-8">
							Our advanced machine learning algorithm analyzes player
							statistics, court conditions, and historical data to predict
							tennis match outcomes with high accuracy.
						</p>
						<div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
							<Link
								to="/predictions"
								className="px-6 py-3 bg-white text-green-700 font-medium rounded-md shadow hover:bg-gray-100 transition"
								onClick={scrollToTop}
							>
								View Predictions
							</Link>
							<Link
								to="/results"
								className="px-6 py-3 text-white border border-white font-medium rounded-md shadow hover:bg-white hover:text-green-700 transition"
								onClick={scrollToTop}
							>
								Check Our Accuracy
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Features section with content constraint */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
					Comprehensive Tennis Analytics
				</h2>
				<p className="text-gray-600 text-center mb-8 max-w-3xl mx-auto">
					Everything you need to understand and predict tennis matches with
					cutting-edge AI technology
				</p>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Link
						to="/predictions"
						className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-1 group"
						onClick={scrollToTop}
					>
						<div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors duration-200">
							<BarChart2Icon className="h-6 w-6 text-green-700" />
						</div>
						<h3 className="font-semibold text-lg mb-2 text-gray-800">
							Match Predictions
						</h3>
						<p className="text-gray-600">
							Get predictions for upcoming and past matches across all major
							tournaments.
						</p>
					</Link>
					<Link
						to="/results"
						className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-1 group"
						onClick={scrollToTop}
					>
						<div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors duration-200">
							<HistoryIcon className="h-6 w-6 text-green-700" />
						</div>
						<h3 className="font-semibold text-lg mb-2 text-gray-800">
							Model Performance
						</h3>
						<p className="text-gray-600">
							Track our prediction performance by tournament and surface.
						</p>
					</Link>
					<Link
						to="/rankings"
						className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-1 group"
						onClick={scrollToTop}
					>
						<div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors duration-200">
							<UserIcon className="h-6 w-6 text-green-700" />
						</div>
						<h3 className="font-semibold text-lg mb-2 text-gray-800">
							Player Rankings
						</h3>
						<p className="text-gray-600">
							Check out the latest live player rankings in real time.
						</p>
					</Link>
				</div>
			</div>

			<div className="w-full py-8 mb-6">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2 className="text-2xl font-bold text-gray-800 mb-4">
							Ready to see what's next?
						</h2>
						<p className="text-gray-600 mb-6 max-w-2xl mx-auto">
							Check out our latest predictions for upcoming tennis matches and
							see how our model has performed in past tournaments.
						</p>
						<Link
							to="/predictions"
							className="px-6 py-3 bg-green-600 text-white font-medium rounded-md shadow hover:bg-green-700 transition"
							onClick={scrollToTop}
						>
							View Latest Predictions
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}

export default HomePage
