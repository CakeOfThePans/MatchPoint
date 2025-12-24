// Odds Formatting

/**
 * Format betting odds to 2 decimal places
 * @param {number|null|undefined} odds - Odds value
 * @param {string} fallback - Fallback value if odds is null/undefined (default: '-')
 * @returns {string} Formatted odds string
 */
export const formatOdds = (odds, fallback = '-') => {
	if (!odds) return fallback
	return odds.toFixed(2)
}

// Match Helper Functions

/**
 * Get opponent player from a match for a given player ID
 * @param {object} match - Match object
 * @param {number} playerId - Player ID
 * @returns {object|null} Opponent player object or null
 */
export const getOpponent = (match, playerId) => {
	if (!match || !playerId) return null
	if (match.home_team_id === parseInt(playerId)) {
		return match.away_team
	}
	return match.home_team
}

/**
 * Get player's odds for a match
 * @param {object} match - Match object
 * @param {number} playerId - Player ID
 * @returns {number|null} Player's odds or null
 */
export const getPlayerOdds = (match, playerId) => {
	if (!match || !playerId) return null
	if (match.home_team_id === parseInt(playerId)) {
		return match.home_team_odds
	}
	return match.away_team_odds
}

/**
 * Get player's prediction probability for a match
 * @param {object} match - Match object
 * @param {number} playerId - Player ID
 * @returns {number|null} Player's prediction probability or null
 */
export const getPlayerPredictionProb = (match, playerId) => {
	if (!match || !playerId) return null
	if (match.home_team_id === parseInt(playerId)) {
		return match.home_team_prediction_prob
	}
	return match.away_team_prediction_prob
}

/**
 * Check if player won the match
 * @param {object} match - Match object
 * @param {number} playerId - Player ID
 * @returns {boolean} True if player won, false otherwise
 */
export const didPlayerWin = (match, playerId) => {
	if (!match || !playerId) return false
	return match.winner_id === parseInt(playerId)
}

// Model Info Functions

/**
 * Get model information for a match
 * @param {object} match - Match object with prediction_model property
 * @returns {object|null} Model info object with label and desc, or null
 */
export const getModelInfo = (match) => {
	if (!match || !match.prediction_model) return null

	const modelInfo = {
		1: {
			label: 'primary',
			desc: 'surface, ranks, points, odds',
		},
		2: {
			label: 'secondary',
			desc: 'surface, odds',
		},
		3: {
			label: 'tertiary',
			desc: 'surface, ranks, points',
		},
	}

	return modelInfo[match.prediction_model] || null
}

