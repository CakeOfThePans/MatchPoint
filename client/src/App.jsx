import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import PredictionsPage from './pages/PredictionsPage'
import ResultsPage from './pages/ResultsPage'
import RankingsPage from './pages/RankingsPage'
import MatchPage from './pages/MatchPage'
import PlayerPage from './pages/PlayerPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
	return (
		<Router>
			<ScrollToTop />
			<div className="min-h-screen bg-gray-50 flex flex-col">
				<Navbar />
				<main className="w-full pt-16 flex-1">
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/predictions" element={<PredictionsPage />} />
						<Route path="/results" element={<ResultsPage />} />
						<Route path="/rankings" element={<RankingsPage />} />
						<Route path="/match/:id" element={<MatchPage />} />
						<Route path="/player/:id" element={<PlayerPage />} />
						<Route path="*" element={<NotFoundPage />} />
					</Routes>
				</main>
				<Footer />
			</div>
		</Router>
	)
}

export default App
