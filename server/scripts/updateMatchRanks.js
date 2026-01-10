import prisma from '../lib/prisma.js'
import XLSX from 'xlsx'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Normalize player name for matching
 * Removes extra spaces, converts to lowercase, handles common variations
 */
const normalizeName = (name) => {
	if (!name || typeof name !== 'string') return ''
	return name
		.toLowerCase()
		.trim()
		.replace(/\s+/g, ' ')
		.replace(/\./g, '')
		.replace(/'/g, ' ')
		.replace(/-/g, ' ')
		.replace(/\d+/g, '')
		.replace(/\(/g, '')
		.replace(/\)/g, '')
}

/**
 * Get last name and first initial from a name
 * Handles two formats:
 * 1. "Sinner J." - Odds format with period (surname tokens before first dot, initials after)
 * 2. "Sinner Jannick" - Regular format (last name is last word, first initial from first word)
 */
const getNameSignature = (name) => {
	if (!name || typeof name !== 'string')
		return { lastName: '', firstInitial: '' }

	// Check if name contains a period (odds format)
	const hasPeriod = name.includes('.')

	if (hasPeriod) {
		// Odds format: Split surname tokens vs initials tokens
		// Surname tokens = everything up to the first token that contains a dot
		// Initials tokens = everything from the first token with a dot onwards
		const normalized = name.toLowerCase().trim()
		const toks = normalized.split(/\s+/).filter((t) => t.length > 0)

		if (toks.length === 0) return { lastName: '', firstInitial: '' }

		const surnameTokens = []
		const initialsTokens = []

		for (const t of toks) {
			if (t.includes('.')) {
				initialsTokens.push(t)
			} else if (initialsTokens.length > 0) {
				// If we've already seen initials, add to initials
				initialsTokens.push(t)
			} else {
				// Otherwise it's a surname token
				surnameTokens.push(t)
			}
		}

		// Last name = final surname token only
		const lastName =
			surnameTokens.length > 0 ? surnameTokens[surnameTokens.length - 1] : ''

		// Initials: join everything, strip non-letters, take first letter
		const initBlob = initialsTokens.join('') // e.g. "j.p." or "zh."
		const initClean = initBlob.replace(/[^a-z]/g, '') // "jp" or "zh"
		const firstInitial = initClean.length > 0 ? initClean[0] : ''

		return { lastName, firstInitial }
	} else {
		// Format: "Sinner Jannick" -> lastname="sinner", firstInitial="j"
		// Format: "Davidovich Fokina Alejandro" -> lastname="fokina", firstInitial="a"
		// Take last 2 words: first of those 2 = last name, second = first name
		const normalized = normalizeName(name)
		const parts = normalized.split(' ').filter((p) => p.length > 0)

		if (parts.length === 0) return { lastName: '', firstInitial: '' }

		// If only one word, use it as last name
		if (parts.length === 1) {
			return { lastName: parts[0], firstInitial: '' }
		}

		// Take last 2 words
		const lastTwoWords = parts.slice(-2)
		// First of last 2 = last name
		const lastName = lastTwoWords[0]
		// Second of last 2 = first name
		const firstName = lastTwoWords[1]
		// First initial = first character of first name
		const firstInitial = firstName.charAt(0)

		return { lastName, firstInitial }
	}
}

/**
 * Check if two names match (using signature matching)
 */
const namesMatch = (name1, name2) => {
	const sig1 = getNameSignature(name1)
	const sig2 = getNameSignature(name2)

	// Match on last name and first initial
	if (sig1.lastName && sig2.lastName) {
		if (
			sig1.lastName === sig2.lastName &&
			sig1.firstInitial === sig2.firstInitial
		) {
			return true
		}
	}

	return false
}

/**
 * Match a database match to an Excel match
 * Handles both cases: winner could be home or away team
 */
const findMatchingExcelMatch = (dbMatch, excelMatches) => {
	for (const excelMatch of excelMatches) {
		const winnerName = excelMatch.Winner
		const loserName = excelMatch.Loser

		// Case 1: Winner is home team, Loser is away team
		const case1Match =
			namesMatch(dbMatch.home_team_name, winnerName) &&
			namesMatch(dbMatch.away_team_name, loserName)

		// Case 2: Winner is away team, Loser is home team
		const case2Match =
			namesMatch(dbMatch.home_team_name, loserName) &&
			namesMatch(dbMatch.away_team_name, winnerName)

		if (case1Match || case2Match) {
			return {
				excelMatch,
				isWinnerHome: case1Match,
			}
		}
	}

	return null
}

/**
 * Main function to match database matches with Excel matches and update rank/points
 */
const matchAndUpdateRanks = async (dbTournamentQuery, excelTournamentQuery) => {
	try {
		console.log('Starting match and update process...')
		console.log(`Database tournament query: ${dbTournamentQuery}`)
		console.log(`Excel tournament query: ${excelTournamentQuery}`)

		// Step 1: Get matches from database
		console.log('\n1. Fetching matches from database...')
		const dbMatches = await prisma.match.findMany({
			where: {
				tournament: {
					tournament_name: {
						contains: dbTournamentQuery,
					},
				},
			},
			include: {
				tournament: true,
			},
		})

		console.log(`Found ${dbMatches.length} matches in database`)

		// Step 2: Read Excel file
		console.log('\n2. Reading Excel file...')
		const excelPath = path.join(__dirname, 'data/2025.xlsx')
		const workbook = XLSX.readFile(excelPath)
		const sheetName = workbook.SheetNames[0]
		const worksheet = workbook.Sheets[sheetName]
		const excelData = XLSX.utils.sheet_to_json(worksheet)

		console.log(`Found ${excelData.length} rows in Excel file`)

		// Step 3: Filter Excel matches by tournament name
		console.log('\n3. Filtering Excel matches by tournament...')
		const excelMatches = excelData.filter((row) => {
			const tournamentName = row.Tournament
			return tournamentName.includes(excelTournamentQuery)
		})

		console.log(
			`Found ${excelMatches.length} matches in Excel matching tournament query`
		)

		// Step 4: Match database matches with Excel matches
		console.log('\n4. Matching database matches with Excel matches...')
		const matchesToUpdate = []
		let matchedCount = 0
		let unmatchedCount = 0

		for (const dbMatch of dbMatches) {
			const match = findMatchingExcelMatch(dbMatch, excelMatches)

			if (match) {
				matchedCount++
				const { excelMatch, isWinnerHome } = match

				// Determine rank and points based on which team won
				let homeRank, homePoints, awayRank, awayPoints

				const winnerRank = excelMatch.WRank ? parseInt(excelMatch.WRank) : null
				const loserRank = excelMatch.LRank ? parseInt(excelMatch.LRank) : null
				const winnerPoints = excelMatch.WPts ? parseInt(excelMatch.WPts) : null
				const loserPoints = excelMatch.LPts ? parseInt(excelMatch.LPts) : null

				if (isWinnerHome) {
					homeRank = winnerRank
					homePoints = winnerPoints
					awayRank = loserRank
					awayPoints = loserPoints
				} else {
					homeRank = loserRank
					homePoints = loserPoints
					awayRank = winnerRank
					awayPoints = winnerPoints
				}

				matchesToUpdate.push({
					matchId: dbMatch.match_id,
					homeTeamName: dbMatch.home_team_name,
					awayTeamName: dbMatch.away_team_name,
					homeRank,
					homePoints,
					awayRank,
					awayPoints,
					excelWinner: excelMatch.Winner,
					excelLoser: excelMatch.Loser,
				})

				console.log(
					`✓ Matched: ${dbMatch.home_team_name} vs ${dbMatch.away_team_name}`
				)
				console.log(`  Home: Rank=${homeRank}, Points=${homePoints}`)
				console.log(`  Away: Rank=${awayRank}, Points=${awayPoints}`)
			} else {
				unmatchedCount++
				console.log(
					`✗ Unmatched: ${dbMatch.home_team_name} vs ${dbMatch.away_team_name}`
				)
			}
		}

		console.log(`\n5. Matching complete:`)
		console.log(`   Matched: ${matchedCount}`)
		console.log(`   Unmatched: ${unmatchedCount}`)
		// console.log(matchesToUpdate)

		// Step 5: Update database if there's no unmatched matches
		if (unmatchedCount === 0) {
			console.log('\n6. Preparing updates...')
			for (const update of matchesToUpdate) {
				await prisma.match.update({
					where: { match_id: update.matchId },
					data: {
						home_team_rank: update.homeRank,
						home_team_points: update.homePoints,
						away_team_rank: update.awayRank,
						away_team_points: update.awayPoints,
					},
				})
			}
			console.log(`Updated ${matchesToUpdate.length} matches`)
		}

		return {
			matched: matchedCount,
			unmatched: unmatchedCount,
			updates: matchesToUpdate,
		}
	} catch (error) {
		console.error('Error in matchAndUpdateRanks:', error)
		throw error
	} finally {
		await prisma.$disconnect()
	}
}

// Example usage: db, excel tournament name
matchAndUpdateRanks('Hong Kong', 'Hong Kong Tennis Open')
	.then((result) => console.log('Done'))
	.catch((error) => console.error('Error:', error))
