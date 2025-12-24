import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

const NotFoundPage = () => {
	const navigate = useNavigate()

	const handleGoBack = () => {
		navigate(-1)
	}

	return (
		<div className="bg-gray-50 min-h-screen w-full">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				<div className="text-center">
					<h1 className="text-9xl font-bold text-green-600 mb-4">404</h1>
					<h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
						Page Not Found
					</h2>
					<p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
						Sorry, the page you're looking for doesn't exist or has been moved.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-4">
						<Link
							to="/"
							className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none cursor-pointer transition-colors"
						>
							<Home className="h-5 w-5 mr-2" />
							Go to Home
						</Link>
						<button
							onClick={handleGoBack}
							className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none cursor-pointer transition-colors"
						>
							<ArrowLeft className="h-5 w-5 mr-2" />
							Go Back
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default NotFoundPage

