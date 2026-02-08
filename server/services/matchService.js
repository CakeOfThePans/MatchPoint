import { scrapeNextMatches } from "../webscraper/matchesScraper.js";
import { scrapeMatch } from "../webscraper/matchScraper.js";
import prisma from "../lib/prisma.js";
import { formatCourtType, determineStatusType, getAge, formatPlayStyle } from "../utils/matchUtils.js";
import { findOrCreatePlayer } from "./playerService.js";
import axios from "axios";

export const updateMatchesFromTournament = async (tournament) => {
  try {
    // tournament is { tournament_id, tournament_name, url }
    const matches = await scrapeNextMatches(tournament.url); // [{ matchName, url, id }, ...]
    for (const match of matches) {
      await updateMatchAndPlayers(match.id, tournament.tournament_id);
      // add a delay of anywhere between 3-7 seconds
      await new Promise(resolve => setTimeout(resolve, Math.random() * 4000 + 3000));
    }
  } catch (error) {
    console.error("Error updating matches from tournament:", error);
    // throw error; // don't throw error so we can continue updating other tournaments
  }
};

export const updateLiveMatches = async () => {
  try {
    const now = new Date();
    const tenHoursAgo = new Date(now.getTime() - 10 * 60 * 60 * 1000); // 10 hours ago

    // Get matches that are currently happening:
    // - start_time <= now (match has started)
    // - start_time > now - 10 hours (within 10 hours after start time)
    // - status_type is not "Completed"
    const matches = await prisma.match.findMany({
      where: {
        start_time: {
          gt: tenHoursAgo, // start_time > (now - 10 hours), meaning now < start_time + 10 hours
          lte: now, // start_time <= now, meaning match has started
        },
        status_type: {
          not: "Completed",
        },
      },
      select: {
        match_id: true,
        tournament_id: true,
      },
    });

    console.log(`Found ${matches.length} live matches to update`);
    for (const match of matches) {
      await updateMatchAndPlayers(match.match_id, match.tournament_id);
      // Add a delay to avoid overwhelming the scraper
      await new Promise(resolve => setTimeout(resolve, Math.random() * 4000 + 3000));
    }

    console.log(`Updated ${matches.length} live matches`);
  } catch (error) {
    console.error("Error updating live matches:", error);
    // throw error; // don't throw error so we can continue updating other tournaments
  }
};

/**
 * Upserts match information and associated players.
 * Uses scrapeMatch to get detailed match information.
 */
export const updateMatchAndPlayers = async (matchId, tournamentId) => {
  try {
    // Scrape detailed match information
    const matchData = await scrapeMatch(matchId);

    if (!matchData || !matchData.players || matchData.players.length < 2) {
      throw new Error(`Insufficient match data for match ${matchId}`);
    }

    const [player1Data, player2Data] = matchData.players;

    // Find or create players and get their IDs
    const homeTeamId = await findOrCreatePlayer(player1Data);
    const awayTeamId = await findOrCreatePlayer(player2Data);

    if (!homeTeamId || !awayTeamId) {
      throw new Error(`Failed to create/find players for match ${matchId}`);
    }
    // Update player ranks and points for the match if available
    const player1 = await prisma.player.findUnique({
      where: {
        player_id: homeTeamId,
      },
    })
    const player2 = await prisma.player.findUnique({
      where: {
        player_id: awayTeamId,
      },
    })
    
    // Parse datetime
    // If datetime is null, don't continue
    if (!matchData.datetime) {
      console.error(`No datetime found for match ${matchId}. Skipping...`);
      return;
    }
    const startTime = new Date(matchData.datetime)

    // Map scraped data to database schema
    const matchUpdateData = {
      name: matchData.matchName,
      surface_type: formatCourtType(matchData.courtType),
      status_type: determineStatusType(matchData.finalScore, matchData.datetime),
      home_team_id: homeTeamId,
      home_team_name: player1Data.name,
      home_team_rank: player1?.rank || null,
      home_team_points: player1?.points || null,
      home_team_hash_image: player1Data.imageUrl || "",
      away_team_id: awayTeamId,
      away_team_name: player2Data.name,
      away_team_rank: player2?.rank || null,
      away_team_points: player2?.points || null,
      away_team_hash_image: player2Data.imageUrl || "",
      start_time: startTime,
      tournament_id: tournamentId,
    };

    // Add odds if available
    if (matchData.averageBettingOdds) {
      matchUpdateData.home_team_odds = matchData.averageBettingOdds.homeAvg || null;
      matchUpdateData.away_team_odds = matchData.averageBettingOdds.awayAvg || null;
    }

    // Get predictions
    const predictions = await getPredictionsByMatch(matchUpdateData, homeTeamId, awayTeamId);
    if (predictions) {
      matchUpdateData.home_team_prediction_prob = predictions.home_team_prediction_prob;
      matchUpdateData.away_team_prediction_prob = predictions.away_team_prediction_prob;
      matchUpdateData.prediction_model = predictions.prediction_model;
      matchUpdateData.winner_prediction_id = predictions.home_team_prediction_prob > predictions.away_team_prediction_prob 
                                             ? homeTeamId : awayTeamId;
    }

    // Determine winner if final score exists
    if (matchData.finalScore) {
      const [homeScore, awayScore] = matchData.finalScore.split(":").map(Number);
      if (homeScore > awayScore) {
        matchUpdateData.winner_id = homeTeamId;
        matchUpdateData.winner_name = player1Data.name;
      } else if (awayScore > homeScore) {
        matchUpdateData.winner_id = awayTeamId;
        matchUpdateData.winner_name = player2Data.name;
      }
      matchUpdateData.score = matchData.finalScore;
    }

    // Upsert match
    const upsertedMatch = await prisma.match.upsert({
      where: {
        match_id: parseInt(matchId),
      },
      update: {
        ...matchUpdateData,
      },
      create: {
        match_id: parseInt(matchId),
        ...matchUpdateData,
      },
    });

    console.log(`Updated match ${matchId} and players for tournament ${tournamentId}`);
    return upsertedMatch;
  } catch (error) {
    console.error(`Error updating match and players for match ${matchId}:`, error);
    throw error;
  }
};

const getPredictionsByMatch = async (match, homeTeamId, awayTeamId) => {
	try {
		// Get ML API URL from environment variable
		const mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000'

    const homeTeam = await prisma.player.findUnique({
      where: {
        player_id: homeTeamId,
      },
    })
    const awayTeam = await prisma.player.findUnique({
      where: {
        player_id: awayTeamId,
      },
    })
    if (!homeTeam || !awayTeam) {
      throw new Error(`Failed to find players for match ${match.match_id}`);
    }

		// Check if we have complete player data for full model
		const hasPrimaryData =
			match.surface_type &&
			homeTeam.plays &&
			awayTeam.plays &&
			homeTeam.height &&
			awayTeam.height &&
			homeTeam.birth_date &&
			awayTeam.birth_date &&
			match.home_team_rank &&
			match.away_team_rank &&
			match.home_team_points &&
			match.away_team_points &&
			match.home_team_odds &&
			match.away_team_odds

		const hasSecondaryData =
			match.surface_type &&
			match.home_team_rank &&
			match.away_team_rank &&
			match.home_team_points &&
			match.away_team_points &&
			match.home_team_odds &&
			match.away_team_odds

		const hasTertiaryData =
			match.surface_type &&
			match.home_team_odds &&
			match.away_team_odds

		let predictionResponse
		let model
		if (hasPrimaryData) {
			// Use full model with all features
			const modelData = {
				surface: match.surface_type,
				p1_hand: formatPlayStyle(homeTeam.plays),
				p2_hand: formatPlayStyle(awayTeam.plays),
				p1_ht: homeTeam.height,
				p2_ht: awayTeam.height,
				p1_age: getAge(match.start_time, homeTeam.birth_date),
				p2_age: getAge(match.start_time, awayTeam.birth_date),
				p1_rank: match.home_team_rank,
				p2_rank: match.away_team_rank,
				p1_points: match.home_team_points,
				p2_points: match.away_team_points,
				p1_odds: match.home_team_odds,
				p2_odds: match.away_team_odds,
			}

			const response = await axios.post(`${mlApiUrl}/predict/primary`, modelData)
			predictionResponse = response.data
			model = 1
		} else if (hasSecondaryData) {
			// Use secondary model with rank, points, odds
			const modelData = {
				surface: match.surface_type,
				p1_rank: match.home_team_rank,
				p2_rank: match.away_team_rank,
				p1_points: match.home_team_points,
				p2_points: match.away_team_points,
				p1_odds: match.home_team_odds,
				p2_odds: match.away_team_odds,
			}

			const response = await axios.post(`${mlApiUrl}/predict/secondary`, modelData)
			predictionResponse = response.data
			model = 2
		} else if (hasTertiaryData) {
			// Use tertiary model with odds only
			const modelData = {
				surface: match.surface_type,
				p1_odds: match.home_team_odds,
				p2_odds: match.away_team_odds,
			}

			const response = await axios.post(`${mlApiUrl}/predict/tertiary`, modelData)
			predictionResponse = response.data
			model = 3
		} else {
			// If we don't even have odds or ranks, we can't make a prediction
			console.log(
				`Insufficient data for prediction for match ${match.match_id}`
			)
			return null
		}

		return {
			home_team_prediction_prob: predictionResponse.player1_win_probability,
			away_team_prediction_prob: predictionResponse.player2_win_probability,
			prediction_model: model,
		}
	} catch (error) {
		console.error('Error fetching predictions:', error)
		return null
	}
}