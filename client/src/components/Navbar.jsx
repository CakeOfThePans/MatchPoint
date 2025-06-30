import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
	BarChart2Icon,
	HistoryIcon,
	HomeIcon,
	Trophy,
	UserIcon,
	Menu,
	X,
} from 'lucide-react'

const Navbar = () => {
	const location = useLocation()
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' })
		setIsMobileMenuOpen(false)
	}

	const isActive = (path) => {
		return location.pathname === path
			? 'bg-green-100 text-green-800'
			: 'text-gray-700 hover:bg-gray-100'
	}

	const handleMobileMenuToggle = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen)
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
										to="/players"
										className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${isActive(
											'/players'
										)}`}
										onClick={scrollToTop}
									>
										<UserIcon className="h-4 w-4 mr-2" />
										Rankings
									</Link>
								</li>
							</ul>
						</nav>
						{/* Mobile hamburger menu button */}
						<button
							onClick={handleMobileMenuToggle}
							className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
							aria-label="Toggle mobile menu"
						>
							{isMobileMenuOpen ? (
								<X className="h-6 w-6" />
							) : (
								<Menu className="h-6 w-6" />
							)}
						</button>
					</div>
				</div>
				{/* Mobile dropdown menu */}
				{isMobileMenuOpen && (
					<div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
						<div className="px-4 py-2 space-y-1">
							<Link
								to="/"
								className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
									location.pathname === '/'
										? 'bg-green-100 text-green-800'
										: 'text-gray-700 hover:bg-gray-100'
								}`}
								onClick={scrollToTop}
							>
								<HomeIcon className="h-5 w-5 mr-3" />
								Home
							</Link>
							<Link
								to="/predictions"
								className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
									location.pathname === '/predictions'
										? 'bg-green-100 text-green-800'
										: 'text-gray-700 hover:bg-gray-100'
								}`}
								onClick={scrollToTop}
							>
								<BarChart2Icon className="h-5 w-5 mr-3" />
								Predictions
							</Link>
							<Link
								to="/results"
								className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
									location.pathname === '/results'
										? 'bg-green-100 text-green-800'
										: 'text-gray-700 hover:bg-gray-100'
								}`}
								onClick={scrollToTop}
							>
								<HistoryIcon className="h-5 w-5 mr-3" />
								Results
							</Link>
							<Link
								to="/players"
								className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
									location.pathname === '/players'
										? 'bg-green-100 text-green-800'
										: 'text-gray-700 hover:bg-gray-100'
								}`}
								onClick={scrollToTop}
							>
								<UserIcon className="h-5 w-5 mr-3" />
								Rankings
							</Link>
						</div>
					</div>
				)}
			</header>
		</>
	)
}

export default Navbar
