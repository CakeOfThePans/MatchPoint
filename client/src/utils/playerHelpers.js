// Player Details Formatting

/**
 * Format player details into an array of label-value pairs
 * @param {object} player - Player object
 * @returns {Array} Array of objects with label and value properties
 */
export const formatPlayerDetails = (match, player, side) => {
	if (!player) return []
	const details = []

	// Rank
	details.push({
		label: 'Rank (At the time)',
		value: (side === 'home' ? match.home_team_rank : match.away_team_rank ) ?? '-' ,
	})

	// Points
	details.push({
		label: 'Points (At the time)',
		value: (side === 'home' ? match.home_team_points : match.away_team_points ) ?? '-' ,
	})

	// Age
	if (player.birth_date) {
		const birthDate = new Date(player.birth_date)
		const age = Math.floor(
			(new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000)
		)
		details.push({ label: 'Age', value: age })
	} else {
		details.push({ label: 'Age', value: '-' })
	}

	// Height
	details.push({
		label: 'Height',
		value: player.height ? `${player.height} cm` : '-',
	})

	// Weight
	details.push({
		label: 'Weight',
		value: player.weight ? `${player.weight} kg` : '-',
	})

	// Plays
	details.push({
		label: 'Plays',
		value: player.plays || '-',
	})

	return details
}

/**
 * Get last name (first word) from full name
 * @param {string} fullName - Full player name
 * @returns {string} Last name or '-' if not available
 */
export const getLastName = (fullName) => {
	if (!fullName) return '-'
	return fullName.split(' ')[0]
}

