import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { getLeagues } from '../utils/api'

const TournamentSelect = ({ selectedId, onSelect }) => {
	const [isOpen, setIsOpen] = useState(false)
	const [leagues, setLeagues] = useState([])
	const [loading, setLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState('')
	const dropdownRef = useRef(null)

	// Fetch leagues from API
	useEffect(() => {
		const fetchLeagues = async () => {
			try {
				setLoading(true)
				const response = await getLeagues()
				setLeagues(response.data || [])
			} catch (error) {
				console.error('Error fetching leagues:', error)
				setLeagues([])
			} finally {
				setLoading(false)
			}
		}

		fetchLeagues()
	}, [])

	// Close dropdown on outside click
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false)
			}
		}
		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		} else {
			document.removeEventListener('mousedown', handleClickOutside)
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isOpen])

	// Filter leagues based on search term
	const filteredLeagues = leagues.filter(
		(league) =>
			league.competition_name
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			league.surface_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
			league.category.toLowerCase().includes(searchTerm.toLowerCase())
	)

	const selectedLeague =
		selectedId != null ? leagues.find((l) => l.league_id === selectedId) : null

	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value)
	}

	const handleSelect = (leagueId) => {
		onSelect(leagueId)
		setIsOpen(false)
		setSearchTerm('') // Clear search when selection is made
	}

	return (
		<div className="relative w-full" ref={dropdownRef}>
			<button
				type="button"
				className="flex items-center justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none cursor-pointer"
				onClick={() => setIsOpen((open) => !open)}
				disabled={loading}
			>
				{loading ? (
					'Loading tournaments...'
				) : selectedLeague ? (
					<span>
						{selectedLeague.competition_name}{' '}
						<span className="text-xs text-gray-400">
							({selectedLeague.surface_type} • {selectedLeague.category})
						</span>
					</span>
				) : (
					'All ATP Tournaments'
				)}
				<ChevronDown className="ml-2 h-4 w-4" />
			</button>
			{isOpen && (
				<div className="absolute z-20 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg py-1 max-h-60 overflow-y-auto top-full overscroll-contain">
					{/* Search input */}
					<div className="px-1 py-1.5 border-b border-gray-200">
						<div className="relative">
							<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
							<input
								type="text"
								placeholder="Search tournaments..."
								value={searchTerm}
								onChange={handleSearchChange}
								className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
								onClick={(e) => e.stopPropagation()}
							/>
						</div>
					</div>

					<div
						className={`cursor-pointer px-4 py-2 rounded-md font-medium hover:bg-green-50 border-b border-gray-100 text-gray-700 whitespace-nowrap ${
							searchTerm.length > 0 ? 'hidden' : ''
						}`}
						onClick={() => handleSelect(null)}
					>
						All ATP Tournaments
					</div>
					{filteredLeagues.length > 0 ? (
						filteredLeagues.map((league, idx) => (
							<div
								key={league.league_id}
								className={`cursor-pointer px-4 py-2 flex flex-col rounded-md hover:bg-green-50 ${
									idx === filteredLeagues.length - 1
										? ''
										: 'border-b border-gray-100'
								} ${selectedId === league.league_id ? 'bg-green-100' : ''}`}
								onClick={() => handleSelect(league.league_id)}
							>
								<span className="font-medium">{league.competition_name}</span>
								<span className="text-xs text-gray-500">
									{league.surface_type} • {league.category}
									{league.is_grand_slam && ' • Grand Slam'}
								</span>
							</div>
						))
					) : (
						<div className="px-4 py-2 text-sm text-gray-500 text-center">
							No tournaments found
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default TournamentSelect
