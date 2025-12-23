import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import PredictionsPage from './pages/PredictionsPage'
import ResultsPage from './pages/ResultsPage'
import PlayersPage from './pages/PlayersPage'

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
						<Route path="/players" element={<PlayersPage />} />
					</Routes>
				</main>
				<Footer />
			</div>
		</Router>
	)
}

export default App
