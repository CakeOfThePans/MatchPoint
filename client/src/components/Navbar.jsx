import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
	BarChart2Icon,
	HistoryIcon,
	HomeIcon,
	SwordsIcon,
	Trophy,
	UserIcon,
} from 'lucide-react'

const Navbar = () => {
	const location = useLocation()

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	const isActive = (path) => {
		return location.pathname === path
			? 'bg-green-100 text-green-800'
			: 'text-gray-700 hover:bg-gray-100'
	}

	return (
		<>
			<header className="fixed top-0 left-0 w-full bg-white shadow-sm border-b border-gray-200 z-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="h-10 flex items-center justify-between">
						<Link
							to="/"
							className="flex items-center gap-2"
							onClick={scrollToTop}
						>
							<Trophy className="h-7 w-7 text-green-600" />
							<span className="text-xl font-bold text-gray-900">
								MatchPoint
							</span>
						</Link>
						<nav className="hidden md:block">
							<ul className="flex space-x-2">
								<li>
									<Link
										to="/"
										className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${isActive(
											'/'
										)}`}
										onClick={scrollToTop}
									>
										<HomeIcon className="h-4 w-4 mr-2" />
										Home
									</Link>
								</li>
								<li>
									<Link
										to="/predictions"
										className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${isActive(
											'/predictions'
										)}`}
										onClick={scrollToTop}
									>
										<BarChart2Icon className="h-4 w-4 mr-2" />
										Predictions
									</Link>
								</li>
								<li>
									<Link
										to="/results"
										className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${isActive(
											'/results'
										)}`}
										onClick={scrollToTop}
									>
										<HistoryIcon className="h-4 w-4 mr-2" />
										Results
									</Link>
								</li>
								<li>
									<Link
										to="/head-to-head"
										className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${isActive(
											'/head-to-head'
										)}`}
										onClick={scrollToTop}
									>
										<SwordsIcon className="h-4 w-4 mr-2" />
										Head to Head
									</Link>
								</li>
								<li>
									<Link
										to="/players"
										className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${isActive(
											'/players'
										)}`}
										onClick={scrollToTop}
									>
										<UserIcon className="h-4 w-4 mr-2" />
										Players
									</Link>
								</li>
							</ul>
						</nav>
					</div>
				</div>
			</header>
			{/* Mobile navigation */}
			<div className="z-20 md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
				<div className="grid grid-cols-5 h-16">
					<Link
						to="/"
						className="flex flex-col items-center justify-center"
						onClick={scrollToTop}
					>
						<HomeIcon
							className={`h-5 w-5 ${
								location.pathname === '/' ? 'text-green-600' : 'text-gray-500'
							}`}
						/>
						<span
							className={`text-xs mt-1 ${
								location.pathname === '/' ? 'text-green-600' : 'text-gray-500'
							}`}
						>
							Home
						</span>
					</Link>
					<Link
						to="/predictions"
						className="flex flex-col items-center justify-center"
						onClick={scrollToTop}
					>
						<BarChart2Icon
							className={`h-5 w-5 ${
								location.pathname === '/predictions'
									? 'text-green-600'
									: 'text-gray-500'
							}`}
						/>
						<span
							className={`text-xs mt-1 ${
								location.pathname === '/predictions'
									? 'text-green-600'
									: 'text-gray-500'
							}`}
						>
							Predictions
						</span>
					</Link>
					<Link
						to="/results"
						className="flex flex-col items-center justify-center"
						onClick={scrollToTop}
					>
						<HistoryIcon
							className={`h-5 w-5 ${
								location.pathname === '/results'
									? 'text-green-600'
									: 'text-gray-500'
							}`}
						/>
						<span
							className={`text-xs mt-1 ${
								location.pathname === '/results'
									? 'text-green-600'
									: 'text-gray-500'
							}`}
						>
							Results
						</span>
					</Link>
					<Link
						to="/head-to-head"
						className="flex flex-col items-center justify-center"
						onClick={scrollToTop}
					>
						<SwordsIcon
							className={`h-5 w-5 ${
								location.pathname === '/head-to-head'
									? 'text-green-600'
									: 'text-gray-500'
							}`}
						/>
						<span
							className={`text-xs mt-1 ${
								location.pathname === '/head-to-head'
									? 'text-green-600'
									: 'text-gray-500'
							}`}
						>
							Head to Head
						</span>
					</Link>
					<Link
						to="/players"
						className="flex flex-col items-center justify-center"
						onClick={scrollToTop}
					>
						<UserIcon
							className={`h-5 w-5 ${
								location.pathname === '/players'
									? 'text-green-600'
									: 'text-gray-500'
							}`}
						/>
						<span
							className={`text-xs mt-1 ${
								location.pathname === '/players'
									? 'text-green-600'
									: 'text-gray-500'
							}`}
						>
							Players
						</span>
					</Link>
				</div>
			</div>
		</>
	)
}

export default Navbar
