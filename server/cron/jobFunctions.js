// Cron job functions for MatchPoint application
import axios from 'axios'
import prisma from '../lib/prisma.js'

// Get leagues happening today/tomorrow
const getLeagues = async () => {
	try {
		console.log('Fetching leagues...')

		// Get leagues for today and tomorrow
		const today = new Date().toISOString().split('T')[0]
		const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
			.toISOString()
			.split('T')[0]

		let config = {
			method: 'GET',
			url: `https://tennis.sportdevs.com/leagues-by-date?date=eq.${today}`,
			headers: {
				Authorization: process.env.SPORTDEVS_API_KEY1,
			},
		}

		let config2 = {
			method: 'GET',
			url: `https://tennis.sportdevs.com/leagues-by-date?date=eq.${tomorrow}`,
			headers: {
				Authorization: process.env.SPORTDEVS_API_KEY1,
			},
		}

		let response = await axios(config)
		// Save only the ATP class leagues
		let atpLeaguesToday = response.data[0].leagues.filter(
			(league) => league.class_name === 'ATP'
		)

		let response2 = await axios(config2)
		let atpLeaguesTomorrow = response2.data[0].leagues.filter(
			(league) => league.class_name === 'ATP'
		)

		let atpLeagues = [...atpLeaguesToday, ...atpLeaguesTomorrow]
		// Remove duplicates
		atpLeagues = atpLeagues.filter(
			(league, index, self) =>
				index === self.findIndex((t) => t.league_id === league.league_id)
		)

		// Get specific info for each league
		for (let league of atpLeagues) {
			let leagueConfig = {
				method: 'GET',
				url: `https://tennis.sportdevs.com/leagues-info?league_id=eq.${league.league_id}`,
				headers: {
					Authorization: process.env.SPORTDEVS_API_KEY1,
				},
			}

			let leagueResponse = await axios(leagueConfig)
			let leagueInfo = leagueResponse.data[0]

			// Only consider singles leagues
			if (leagueInfo.match_type !== 'singles') continue

			// Store the league info in the database
			try {
				await prisma.league.upsert({
					where: {
						league_id: league.league_id,
					},
					update: {
						competition_name: leagueInfo.competition_name,
						city_name: leagueInfo.city_name,
						surface_type: leagueInfo.surface_type,
						match_type: leagueInfo.match_type,
						number_of_teams: leagueInfo.number_of_teams,
						category: leagueInfo.category,
						last_checked: new Date(),
					},
					create: {
						league_id: league.league_id,
						competition_name: leagueInfo.competition_name,
						city_name: leagueInfo.city_name,
						surface_type: leagueInfo.surface_type,
						match_type: leagueInfo.match_type,
						number_of_teams: leagueInfo.number_of_teams,
						category: leagueInfo.category,
						is_grand_slam: false,
						last_checked: new Date(),
					},
				})

				console.log(
					`League ${league.league_id} (${leagueInfo.competition_name}) stored/updated successfully`
				)
			} catch (dbError) {
				console.error(`Error storing league ${league.league_id}:`, dbError)
			}
		}
	} catch (error) {
		console.error('Error fetching leagues:', error)
	}
}

// Get matches for today/tomorrow
const getMatches = async () => {
	try {
		console.log('Fetching matches...')

		// Get all leagues that were tagged today
		let leagues = await prisma.league.findMany({
			where: {
				last_checked: {
					gte: new Date(new Date().setUTCHours(0, 0, 0, 0)),
					lt: new Date(new Date().setUTCHours(23, 59, 59, 999)),
				},
			},
		})

		// Get matches for each league
		let today = new Date().toISOString().split('T')[0]
		let dayAfterTomorrow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
			.toISOString()
			.split('T')[0]

		for (let league of leagues) {
			// Handle pagination if there are more than 50 matches since the API only returns 50 at a time
			let offset = 0
			let hasMore = true
			let matches = []

			while (hasMore) {
				let config = {
					method: 'GET',
					url: `https://tennis.sportdevs.com/matches?start_time=gte.${today}&start_time=lt.${dayAfterTomorrow}&league_id=eq.${league.league_id}&offset=${offset}`,
					headers: {
						Authorization: process.env.SPORTDEVS_API_KEY1,
					},
				}

				let response = await axios(config)
				matches.push(...response.data)

				offset += 50

				// Check if there are more matches
				if (response.data.length < 50) {
					hasMore = false
				}
			}

			console.log(
				`Found ${matches.length} matches for league ${league.league_id}`
			)

			// Store the matches in the database
			for (let match of matches) {
				try {
					// Ignore matches with unidentified players (players that are not in the database most likely outside of the top 500)
					const homePlayer = await prisma.player.findUnique({
						where: {
							player_id: match.home_team_id,
						},
					})
					const awayPlayer = await prisma.player.findUnique({
						where: {
							player_id: match.away_team_id,
						},
					})

					if (!homePlayer || !awayPlayer) {
						continue
					}

					// Store the match
					await prisma.match.upsert({
						where: {
							match_id: match.id,
						},
						update: {
							name: match.name,
							ground_type: match.ground_type,
							status_type: match.status_type,
							home_team_id: match.home_team_id,
							home_team_name: match.home_team_name,
							home_team_hash_image: match.home_team_hash_image,
							away_team_id: match.away_team_id,
							away_team_name: match.away_team_name,
							away_team_hash_image: match.away_team_hash_image,
							start_time: new Date(match.start_time),
							season_name: match.season_name,
							league_id: match.league_id,
						},
						create: {
							match_id: match.id,
							name: match.name,
							ground_type: match.ground_type,
							status_type: match.status_type,
							home_team_id: match.home_team_id,
							home_team_name: match.home_team_name,
							home_team_hash_image: match.home_team_hash_image,
							away_team_id: match.away_team_id,
							away_team_name: match.away_team_name,
							away_team_hash_image: match.away_team_hash_image,
							start_time: new Date(match.start_time),
							season_name: match.season_name,
							league_id: match.league_id,
						},
					})

					// Update the winner if the match is finished and the scores are available
					if (
						match.home_team_score &&
						match.away_team_score &&
						match.status_type === 'finished'
					) {
						let winnerId = null
						let winnerName = null

						// Get the period arrays for both teams
						let homePeriods = [
							match.home_team_score.period_1,
							match.home_team_score.period_2,
							match.home_team_score.period_3,
							match.home_team_score.period_4,
							match.home_team_score.period_5,
						].filter((score) => score !== undefined)

						let awayPeriods = [
							match.away_team_score.period_1,
							match.away_team_score.period_2,
							match.away_team_score.period_3,
							match.away_team_score.period_4,
							match.away_team_score.period_5,
						].filter((score) => score !== undefined)

						// Determine winner based off current scores
						if (match.home_team_score.current > match.away_team_score.current) {
							winnerId = match.home_team_id
							winnerName = match.home_team_name
						} else if (
							match.away_team_score.current > match.home_team_score.current
						) {
							winnerId = match.away_team_id
							winnerName = match.away_team_name
						}
						// Sometimes, the API didn't update the final score, so we need to check the last period ourselves
						else {
							// Get the last period scores to determine actual winner
							let homeLastPeriod = homePeriods[homePeriods.length - 1]
							let awayLastPeriod = awayPeriods[awayPeriods.length - 1]

							if (homeLastPeriod > awayLastPeriod) {
								winnerId = match.home_team_id
								winnerName = match.home_team_name
							} else if (awayLastPeriod > homeLastPeriod) {
								winnerId = match.away_team_id
								winnerName = match.away_team_name
							}
							// If the last periods are equal (most likely 6-6 or just some error like 0-0), unfortunately we can't determine the winner
							// We'll have to manually update the score in the database
						}

						// Update the match with the winner
						await prisma.match.update({
							where: { match_id: match.id },
							data: {
								winner_id: winnerId,
								winner_name: winnerName,
							},
						})
					}

					// TODO: Update the match with the model result if the match is finished (and the winner is known) and it hasn't been processed yet

					console.log(
						`Match ${match.id} (${match.name}) stored/updated successfully`
					)
				} catch (dbError) {
					console.error(`Error storing match ${match.id}:`, dbError)
				}
			}
		}
	} catch (error) {
		console.error('Error fetching matches:', error)
	}
}

// Get betting odds based on the match id
const getBettingOdds = async (matchId) => {
	try {
		// TODO: Implement betting odds fetching logic
		let config = {
			method: 'GET',
			url: `https://tennis.sportdevs.com/odds/match-winner?match_id=eq.${matchId}&is_live=eq.false`,
			headers: {
				Authorization: process.env.SPORTDEVS_API_KEY2,
			},
		}

		let response = await axios(config)
		let periods = response.data[0].periods
		// We want the odds for the full match
		let fullMatchOdds = periods.filter(
			(period) => period.period_type === 'Full Time'
		)
		let Bet365Odds = fullMatchOdds[0].odds.find(
			(odds) => odds.bookmaker_name === 'Bet365'
		)

		// Update the match with the betting odds
		await prisma.match.update({
			where: { match_id: matchId },
			data: {
				home_team_odds: Bet365Odds.home,
				away_team_odds: Bet365Odds.away,
			},
		})
		console.log(`Betting odds for match ${matchId} updated successfully`)
	} catch (error) {
		console.error('Error fetching betting odds:', error)
	}
}

// Get betting odds for matches today/tomorrow
const getDailyBettingOdds = async () => {
	try {
		console.log('Fetching daily betting odds...')

		// Get all matches that are happening today/tomorrow
		let today = new Date(new Date().setUTCHours(0, 0, 0, 0))
		let dayAfterTomorrow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)

		let matches = await prisma.match.findMany({
			where: {
				start_time: {
					gte: today,
					lt: dayAfterTomorrow,
				},
			},
		})

		for (let match of matches) {
			await getBettingOdds(match.match_id)
		}

		console.log('Daily betting odds fetched successfully')
	} catch (error) {
		console.error('Error fetching daily betting odds:', error)
	}
}

// Get predictions for a match
const getPredictions = async (matchId) => {
	try {
		// TODO: Implement prediction fetching logic
		// For now just return 80% chance of home win, 20% chance of away win
		return {
			home_team_prediction_prob: 0.8,
			away_team_prediction_prob: 0.2,
		}
	} catch (error) {
		console.error('Error fetching predictions:', error)
	}
}

// Update predictions for matches today/tomorrow
const updatePredictions = async () => {
	try {
		console.log('Updating predictions...')

		// Get all matches that are happening today/tomorrow
		let today = new Date(new Date().setUTCHours(0, 0, 0, 0))
		let dayAfterTomorrow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)

		let matches = await prisma.match.findMany({
			where: {
				start_time: {
					gte: today,
					lt: dayAfterTomorrow,
				},
			},
		})

		for (let match of matches) {
			// If the match is finished, we shouldn't update the predictions anymore
			if (match.status_type === 'finished') {
				continue
			}

			// On the off chance the match doesn't have betting odds yet, we should get them
			if (!match.home_team_odds || !match.away_team_odds) {
				await getBettingOdds(match.match_id)
			}

			// Get the predictions for the match
			let prediction = await getPredictions(match.match_id)

			// Update the match with the predictions
			await prisma.match.update({
				where: { match_id: match.match_id },
				data: {
					home_team_prediction_prob: prediction.home_team_prediction_prob,
					away_team_prediction_prob: prediction.away_team_prediction_prob,
					winner_prediction_id:
						prediction.home_team_prediction_prob >
						prediction.away_team_prediction_prob
							? match.home_team_id
							: match.away_team_id,
				},
			})
		}

		console.log('Predictions updated successfully')
	} catch (error) {
		console.error('Error updating predictions:', error)
	}
}

// Update ML results for matches today
const updateMLResults = async () => {
	try {
		console.log('Updating ML results...')

		// First update overall ML results
		let overallMLResults = await prisma.mLResultOverall.findUnique({
			where: {
				id: 1, // There is only one overall ML result
			},
		})

		// If the overall ML results don't exist, create them
		if (!overallMLResults) {
			await prisma.mlResultOverall.create({
				data: {
					correct_predictions: 0,
					incorrect_predictions: 0,
				},
			})
		}

		// Gather all matches that have finished
		let finishedMatches = await prisma.match.findMany({
			where: {
				status_type: 'finished',
			},
		})

		// For each match, check if the winner prediction is correct
		let correctPredictions = 0
		let incorrectPredictions = 0

		for (let match of finishedMatches) {
			if (match.winner_prediction_id === match.winner_id) {
				correctPredictions++
			} else {
				incorrectPredictions++
			}
		}

		// Update the overall ML results
		await prisma.mLResultOverall.update({
			where: { id: 1 },
			data: {
				correct_predictions: correctPredictions,
				incorrect_predictions: incorrectPredictions,
			},
		})
		console.log(
			`Overall ML results updated successfully: ${correctPredictions} correct, ${incorrectPredictions} incorrect`
		)

		// Get all leagues that were tagged today
		let leagues = await prisma.league.findMany({
			where: {
				last_checked: {
					gte: new Date(new Date().setUTCHours(0, 0, 0, 0)),
					lt: new Date(new Date().setUTCHours(23, 59, 59, 999)),
				},
			},
		})

		// First check if the ML results for each league exist, if not create them
		for (let league of leagues) {
			let mlResults = await prisma.mLResultByLeague.findUnique({
				where: {
					league_id: league.league_id,
				},
			})
			if (!mlResults) {
				await prisma.mLResultByLeague.create({
					data: {
						league_id: league.league_id,
						correct_predictions: 0,
						incorrect_predictions: 0,
					},
				})
			}
		}

		// For each league update the ML results
		for (let league of leagues) {
			// Get all matches for the league
			let leagueMatches = await prisma.match.findMany({
				where: {
					league_id: league.league_id,
					status_type: 'finished',
				},
			})

			// For each match, check if the winner prediction is correct
			let correctPredictions = 0
			let incorrectPredictions = 0

			for (let match of leagueMatches) {
				if (match.winner_prediction_id === match.winner_id) {
					correctPredictions++
				} else {
					incorrectPredictions++
				}
			}

			// Update the ML results for the league
			await prisma.mLResultByLeague.update({
				where: { league_id: league.league_id },
				data: {
					correct_predictions: correctPredictions,
					incorrect_predictions: incorrectPredictions,
				},
			})
			console.log(
				`ML results for league ${league.league_id} updated successfully: ${correctPredictions} correct, ${incorrectPredictions} incorrect`
			)
		}

		console.log('ML results updated successfully')
	} catch (error) {
		console.error('Error updating ML results:', error)
	}
}

// Update ATP rankings
const updateATPRankings = async () => {
	try {
		console.log('Updating ATP rankings...')

		// Get the ATP rankings
		// The API only returns 50 ranks at a time, so we need to loop through all of them

		let offset = 0
		let allRanks = []
		let hasMore = true

		while (hasMore) {
			let config = {
				method: 'GET',
				url: `https://tennis.sportdevs.com/rankings?type=eq.atp&class=eq.now&offset=${offset}`,
				headers: {
					Authorization: process.env.SPORTDEVS_API_KEY1,
				},
			}

			let response = await axios(config)
			allRanks.push(...response.data)

			offset += 50

			// Check if there are more ranks
			if (response.data.length < 50) {
				hasMore = false
			}
		}

		// Store the ranks in the database
		for (let rank of allRanks) {
			try {
				await prisma.player.upsert({
					where: {
						player_id: rank.team_id,
					},
					update: {
						team_name: rank.team_name,
						team_hash_image: rank.team_hash_image,
						rank: rank.rank,
						points: rank.points,
						next_win_points: rank.next_win_points,
					},
					create: {
						player_id: rank.team_id,
						team_name: rank.team_name,
						team_hash_image: rank.team_hash_image,
						rank: rank.rank,
						points: rank.points,
						next_win_points: rank.next_win_points,
					},
				})

				console.log(
					`Player ${rank.team_id} (${rank.team_name}) - Rank ${rank.rank} stored/updated successfully`
				)
			} catch (dbError) {
				console.error(`Error storing player ${rank.team_id}:`, dbError)
			}
		}

		console.log(`Successfully processed ${allRanks.length} player rankings`)
	} catch (error) {
		console.error('Error updating ATP rankings:', error)
	}
}

const runDailyJobs = async () => {
	try {
		await updateATPRankings()
		await getLeagues()
		await getMatches()
		await getDailyBettingOdds()
		await updatePredictions()

		console.log('Daily cron jobs completed successfully')
	} catch (error) {
		console.error('Error in daily cron jobs:', error)
	}
}

const runHourlyJobs = async () => {
	try {
		await getMatches()
		await updatePredictions()
		await updateMLResults()

		console.log('Hourly cron jobs completed successfully')
	} catch (error) {
		console.error('Error in hourly cron jobs:', error)
	}
}

export {
	runDailyJobs,
	runHourlyJobs,
}
