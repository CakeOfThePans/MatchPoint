import React, { useState, useRef, useEffect } from 'react'
import { tournaments } from '../utils/mockData'
import { ChevronDown } from 'lucide-react'

const TournamentSelect = ({ selectedId, onSelect }) => {
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef(null)

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

	const selectedTournament =
		selectedId != null ? tournaments.find((t) => t.id === selectedId) : null

	return (
		<div className="relative w-full" ref={dropdownRef}>
			<button
				type="button"
				className="flex items-center justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
				onClick={() => setIsOpen((open) => !open)}
			>
				{selectedTournament ? (
					<span>
						{selectedTournament.name}{' '}
						<span className="text-xs text-gray-400">
							({selectedTournament.surface} • {selectedTournament.category})
						</span>
					</span>
				) : (
					'All Tournaments'
				)}
				<ChevronDown className="ml-2 h-4 w-4" />
			</button>
			{isOpen && (
				<div className="absolute z-20 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg py-1">
					<div
						className="cursor-pointer px-4 py-2 rounded-md hover:bg-green-50 border-b border-gray-100 text-gray-700"
						onClick={() => {
							onSelect(null)
							setIsOpen(false)
						}}
					>
						All Tournaments
					</div>
					{tournaments.map((tournament, idx) => (
						<div
							key={tournament.id}
							className={`cursor-pointer px-4 py-2 flex flex-col rounded-md hover:bg-green-50 ${
								idx === tournaments.length - 1 ? '' : 'border-b border-gray-100'
							} ${selectedId === tournament.id ? 'bg-green-100' : ''}`}
							onClick={() => {
								onSelect(tournament.id)
								setIsOpen(false)
							}}
						>
							<span className="font-medium">{tournament.name}</span>
							<span className="text-xs text-gray-500">
								{tournament.surface} • {tournament.category}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default TournamentSelect
