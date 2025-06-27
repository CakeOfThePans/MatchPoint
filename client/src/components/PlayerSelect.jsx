import React, { useState, useRef, useEffect } from 'react'
import { players } from '../utils/mockData'
import { ChevronDown } from 'lucide-react'

const PlayerSelect = ({
	selectedPlayer,
	onSelect,
	placeholder = 'Select a player',
}) => {
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

	return (
		<div className="relative w-full" ref={dropdownRef}>
			<button
				type="button"
				className="flex items-center justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
				onClick={() => setIsOpen((open) => !open)}
			>
				{selectedPlayer ? (
					<span className="flex items-center gap-2">
						<img
							src={selectedPlayer.image}
							alt={selectedPlayer.name}
							className="w-6 h-6 rounded-full object-cover"
						/>
						<span>
							{selectedPlayer.name}{' '}
							<span className="text-xs text-gray-400">
								({selectedPlayer.country})
							</span>
						</span>
					</span>
				) : (
					<span className="text-gray-400">{placeholder}</span>
				)}
				<ChevronDown className="ml-2 h-4 w-4" />
			</button>
			{isOpen && (
				<div className="absolute z-20 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg py-1 max-h-64 overflow-y-auto">
					{players.map((player, idx) => (
						<div
							key={player.id}
							className={`cursor-pointer px-4 py-2 flex items-center gap-2 rounded-md hover:bg-green-50 ${
								idx === players.length - 1 ? '' : 'border-b border-gray-100'
							} ${
								selectedPlayer && selectedPlayer.id === player.id
									? 'bg-green-100'
									: ''
							}`}
							onClick={() => {
								onSelect(player)
								setIsOpen(false)
							}}
						>
							<img
								src={player.image}
								alt={player.name}
								className="w-6 h-6 rounded-full object-cover"
							/>
							<span className="font-medium">{player.name}</span>
							<span className="text-xs text-gray-500 ml-2">
								{player.country}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default PlayerSelect
