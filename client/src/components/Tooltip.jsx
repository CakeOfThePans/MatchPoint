import React, { useState } from 'react'

const Tooltip = ({ children, content, className = '' }) => {
	const [isVisible, setIsVisible] = useState(false)
	const [position, setPosition] = useState({ x: 0, y: 0 })
	const [isAbove, setIsAbove] = useState(true)

	const handleMouseEnter = (e) => {
		const rect = e.currentTarget.getBoundingClientRect()
		const tooltipWidth = 192 // max-w-48 = 12rem = 192px
		const windowWidth = window.innerWidth

		// Calculate initial position (centered)
		let x = rect.left + rect.width / 2

		// Adjust if tooltip would go off the left edge
		if (x - tooltipWidth / 2 < 10) {
			x = tooltipWidth / 2 + 10
		}

		// Adjust if tooltip would go off the right edge
		if (x + tooltipWidth / 2 > windowWidth - 10) {
			x = windowWidth - tooltipWidth / 2 - 10
		}

		// Calculate y position (above the element)
		let y = rect.top - 10
		let above = true

		// If tooltip would go off the top, position it below the element instead
		if (y < 10) {
			y = rect.bottom + 10
			above = false
		}

		setPosition({
			x: x,
			y: y,
		})
		setIsAbove(above)
		setIsVisible(true)
	}

	const handleMouseLeave = () => {
		setIsVisible(false)
	}

	return (
		<div className={`relative inline-block ${className}`}>
			<div
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				className="cursor-help"
			>
				{children}
			</div>
			{isVisible && (
				<div
					className="fixed z-30 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg max-w-48 border border-gray-600 normal-case"
					style={{
						left: `${position.x}px`,
						top: `${position.y}px`,
						transform: isAbove
							? 'translateX(-50%) translateY(-100%)'
							: 'translateX(-50%)',
					}}
				>
					{content}
					<div
						className={`absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-transparent ${
							isAbove
								? 'top-full border-t-3 border-t-gray-800'
								: 'bottom-full border-b-3 border-b-gray-800'
						}`}
					></div>
				</div>
			)}
		</div>
	)
}

export default Tooltip
