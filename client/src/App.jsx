import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import PredictionsPage from './pages/PredictionsPage'
import ResultsPage from './pages/ResultsPage'
import HeadToHeadPage from './pages/HeadToHeadPage'
import PlayerStatsPage from './pages/PlayerStatsPage'

function App() {
	return (
		<Router>
			<div className="min-h-screen bg-gray-50 flex flex-col">
				<Navbar />
				<main className="w-full pt-16 flex-1">
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/predictions" element={<PredictionsPage />} />
						<Route path="/results" element={<ResultsPage />} />
						<Route path="/head-to-head" element={<HeadToHeadPage />} />
						<Route path="/players" element={<PlayerStatsPage />} />
					</Routes>
				</main>
				<Footer />
			</div>
		</Router>
	)
}

export default App
