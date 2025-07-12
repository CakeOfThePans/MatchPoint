import React, { useState } from 'react'
import { createPortal } from 'react-dom'

const Tooltip = ({ children, content, className = '' }) => {
	const [isVisible, setIsVisible] = useState(false)
	const [position, setPosition] = useState({ x: 0, y: 0 })
	const [isAbove, setIsAbove] = useState(true)

	const handleMouseEnter = (e) => {
		const rect = e.currentTarget.getBoundingClientRect()
		const windowWidth = window.innerWidth
		const windowHeight = window.innerHeight

		// Estimate tooltip dimensions
		const estimatedTooltipWidth = Math.min(300, windowWidth - 20)
		const estimatedTooltipHeight = 80 // Rough estimate for multi-line content

		// Calculate initial position (centered horizontally)
		let x = rect.left + rect.width / 2
		let y = rect.top - 10
		let above = true

		// Adjust horizontal position to keep tooltip within viewport
		// Add extra margin for border and shadow
		const margin = 15
		if (x - estimatedTooltipWidth / 2 < margin) {
			x = estimatedTooltipWidth / 2 + margin
		}
		if (x + estimatedTooltipWidth / 2 > windowWidth - margin) {
			x = windowWidth - estimatedTooltipWidth / 2 - margin
		}

		// Adjust vertical position
		if (y - estimatedTooltipHeight < margin) {
			y = rect.bottom + margin
			above = false
		}
		if (y + estimatedTooltipHeight > windowHeight - margin) {
			y = windowHeight - estimatedTooltipHeight - margin
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

	const tooltipContent = isVisible && (
		<div
			className="fixed z-50 px-3 py-2 text-xs text-white bg-gray-800 rounded shadow-lg border border-gray-600 normal-case leading-relaxed whitespace-normal"
			style={{
				left: `${position.x}px`,
				top: `${position.y}px`,
				maxWidth: '300px',
				width: 'max-content',
				transform: isAbove
					? 'translateX(-50%) translateY(-100%)'
					: 'translateX(-50%)',
			}}
		>
			{content}
		</div>
	)

	return (
		<div className={`relative inline-block ${className}`}>
			<div
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				{children}
			</div>
			{tooltipContent && createPortal(tooltipContent, document.body)}
		</div>
	)
}

export default Tooltip
