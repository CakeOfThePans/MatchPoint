/**
 * Middleware to authenticate requests using API key
 * Expects API key in Authorization header as "Bearer <API_KEY>"
 * or in X-API-Key header
 */
export const apiKeyAuth = (req, res, next) => {
	const apiKey = process.env.ADMIN_API_KEY

	if (!apiKey) {
		return res.status(500).json({
			error: 'Server configuration error: ADMIN_API_KEY not set',
		})
	}

	// Check for API key in Authorization header (Bearer token format)
	const authHeader = req.headers.authorization
	let providedKey = null

	if (authHeader && authHeader.startsWith('Bearer ')) {
		providedKey = authHeader.substring(7)
	} else if (req.headers['x-api-key']) {
		// Also support X-API-Key header
		providedKey = req.headers['x-api-key']
	}

	if (!providedKey || providedKey !== apiKey) {
		return res.status(401).json({
			error: 'Unauthorized: Invalid or missing API key',
		})
	}

	next()
}

