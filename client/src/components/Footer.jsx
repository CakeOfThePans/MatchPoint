import React from 'react'

const Footer = () => {
	return (
		<footer className="bg-gray-100 border-t border-gray-200 mt-auto pb-4">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<p className="text-center text-sm text-gray-500">
					© {new Date().getFullYear()} MatchPoint. All rights reserved.
				</p>
			</div>
		</footer>
	)
}

export default Footer
