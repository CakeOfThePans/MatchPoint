// Pagination Helper Functions

/**
 * Generate page numbers array for pagination with ellipsis
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 * @returns {Array} Array of page numbers and ellipsis strings
 */
export const getPageNumbers = (currentPage, totalPages) => {
	const pages = []
	const current = currentPage

	if (totalPages <= 7) {
		// Show all pages if 7 or fewer
		for (let i = 1; i <= totalPages; i++) {
			pages.push(i)
		}
	} else {
		// Show first page, last page, current page, and 2 pages around current
		if (current <= 4) {
			for (let i = 1; i <= 5; i++) {
				pages.push(i)
			}
			pages.push('...')
			pages.push(totalPages)
		} else if (current >= totalPages - 3) {
			pages.push(1)
			pages.push('...')
			for (let i = totalPages - 4; i <= totalPages; i++) {
				pages.push(i)
			}
		} else {
			pages.push(1)
			pages.push('...')
			for (let i = current - 1; i <= current + 1; i++) {
				pages.push(i)
			}
			pages.push('...')
			pages.push(totalPages)
		}
	}

	return pages
}

/**
 * Create pagination handlers
 * @param {function} setCurrentPage - Function to set current page
 * @param {object} pagination - Pagination object with pages property
 * @param {boolean} scrollToTop - Whether to scroll to top on page change (default: false)
 * @returns {object} Object with handlePreviousPage, handleNextPage, and handlePageChange functions
 */
export const createPaginationHandlers = (
	setCurrentPage,
	pagination,
	scrollToTop = false
) => {
	const handlePreviousPage = () => {
		if (pagination.page > 1) {
			setCurrentPage(pagination.page - 1)
			if (scrollToTop) {
				window.scrollTo({ top: 0, behavior: 'smooth' })
			}
		}
	}

	const handleNextPage = () => {
		if (pagination.page < pagination.pages) {
			setCurrentPage(pagination.page + 1)
			if (scrollToTop) {
				window.scrollTo({ top: 0, behavior: 'smooth' })
			}
		}
	}

	const handlePageChange = (page) => {
		setCurrentPage(page)
		if (scrollToTop) {
			window.scrollTo({ top: 0, behavior: 'smooth' })
		}
	}

	return {
		handlePreviousPage,
		handleNextPage,
		handlePageChange,
	}
}

