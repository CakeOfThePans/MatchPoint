import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
	const { pathname } = useLocation()

	useEffect(() => {
		// Scroll after a short delay to handle browser scroll restoration
		const timeoutId = setTimeout(() => {
			window.scrollTo(0, 0)
		}, 0)

		return () => clearTimeout(timeoutId)
	}, [pathname])

	return null
}

export default ScrollToTop
