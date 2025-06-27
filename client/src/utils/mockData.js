// Mock data for the tennis prediction website
export const players = [
  {
    id: 1,
    name: "Novak Djokovic",
    country: "Serbia",
    rank: 1,
    image: "https://images.unsplash.com/photo-1598880513756-c5945c2a3fb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    stats: {
      titles: 93,
      grandSlams: 23,
      yearsPlayed: 20,
      winLossRatio: 0.83,
      surfaceWinRate: {
        hard: 0.84,
        clay: 0.80,
        grass: 0.85
      },
      recentForm: [
        { tournament: "Wimbledon", result: "Winner" },
        { tournament: "French Open", result: "Winner" },
        { tournament: "Australian Open", result: "Winner" },
        { tournament: "ATP Finals", result: "Semi-finalist" },
        { tournament: "US Open", result: "Finalist" }
      ],
      yearlyRanking: [
        { year: 2023, rank: 1 },
        { year: 2022, rank: 1 },
        { year: 2021, rank: 1 },
        { year: 2020, rank: 1 },
        { year: 2019, rank: 2 }
      ]
    }
  },
  {
    id: 2,
    name: "Rafael Nadal",
    country: "Spain",
    rank: 2,
    image: "https://images.unsplash.com/photo-1599152431099-c6cdb9a7a35c?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    stats: {
      titles: 92,
      grandSlams: 22,
      yearsPlayed: 19,
      winLossRatio: 0.83,
      surfaceWinRate: {
        hard: 0.78,
        clay: 0.91,
        grass: 0.78
      },
      recentForm: [
        { tournament: "Australian Open", result: "Second Round" },
        { tournament: "French Open", result: "Not Played" },
        { tournament: "Wimbledon", result: "Not Played" },
        { tournament: "US Open", result: "Fourth Round" },
        { tournament: "ATP Finals", result: "Group Stage" }
      ],
      yearlyRanking: [
        { year: 2023, rank: 9 },
        { year: 2022, rank: 2 },
        { year: 2021, rank: 6 },
        { year: 2020, rank: 2 },
        { year: 2019, rank: 1 }
      ]
    }
  },
  {
    id: 3,
    name: "Iga Świątek",
    country: "Poland",
    rank: 1,
    image: "https://images.unsplash.com/photo-1590171602045-f9a6b5f6a92b?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    stats: {
      titles: 15,
      grandSlams: 4,
      yearsPlayed: 5,
      winLossRatio: 0.77,
      surfaceWinRate: {
        hard: 0.75,
        clay: 0.90,
        grass: 0.65
      },
      recentForm: [
        { tournament: "Wimbledon", result: "Quarter-finalist" },
        { tournament: "French Open", result: "Winner" },
        { tournament: "Australian Open", result: "Fourth Round" },
        { tournament: "US Open", result: "Winner" },
        { tournament: "WTA Finals", result: "Semi-finalist" }
      ],
      yearlyRanking: [
        { year: 2023, rank: 1 },
        { year: 2022, rank: 1 },
        { year: 2021, rank: 9 },
        { year: 2020, rank: 17 },
        { year: 2019, rank: 61 }
      ]
    }
  }
];
// Tournaments data
export const tournaments = [
  {
    id: 1,
    name: 'Australian Open',
    location: 'Melbourne, Australia',
    surface: 'Hard',
    startDate: '2024-01-14',
    endDate: '2024-01-28',
    category: 'Grand Slam',
  },
  {
    id: 2,
    name: 'French Open',
    location: 'Paris, France',
    surface: 'Clay',
    startDate: '2024-05-26',
    endDate: '2024-06-09',
    category: 'Grand Slam',
  },
  {
    id: 3,
    name: 'Wimbledon',
    location: 'London, UK',
    surface: 'Grass',
    startDate: '2024-07-01',
    endDate: '2024-07-14',
    category: 'Grand Slam',
  },
  {
    id: 4,
    name: 'US Open',
    location: 'New York, USA',
    surface: 'Hard',
    startDate: '2024-08-26',
    endDate: '2024-09-08',
    category: 'Grand Slam',
  },
  {
    id: 5,
    name: 'Madrid Open',
    location: 'Madrid, Spain',
    surface: 'Clay',
    startDate: '2024-04-22',
    endDate: '2024-05-05',
    category: 'Masters 1000',
  },
]
// Upcoming matches data
export const upcomingMatches = [
  {
    id: 1,
    tournamentId: 5,
    player1Id: 1,
    player2Id: 2,
    round: 'Final',
    scheduledTime: '2024-05-05T15:00:00',
    court: 'Center Court',
    prediction: {
      player1Chance: 55,
      player2Chance: 45,
      confidenceScore: 75,
    },
  },
  {
    id: 2,
    tournamentId: 5,
    player1Id: 3,
    player2Id: 4,
    round: 'Semi-final',
    scheduledTime: '2024-05-04T13:30:00',
    court: 'Court 1',
    prediction: {
      player1Chance: 48,
      player2Chance: 52,
      confidenceScore: 65,
    },
  },
  {
    id: 3,
    tournamentId: 5,
    player1Id: 5,
    player2Id: 1,
    round: 'Semi-final',
    scheduledTime: '2024-05-04T16:00:00',
    court: 'Center Court',
    prediction: {
      player1Chance: 40,
      player2Chance: 60,
      confidenceScore: 80,
    },
  },
  {
    id: 4,
    tournamentId: 5,
    player1Id: 6,
    player2Id: 7,
    round: 'Final',
    scheduledTime: '2024-05-05T12:00:00',
    court: 'Center Court',
    prediction: {
      player1Chance: 65,
      player2Chance: 35,
      confidenceScore: 85,
    },
  },
]
// Past matches with results
export const pastMatches = [
  {
    id: 101,
    tournamentId: 1,
    player1Id: 1,
    player2Id: 3,
    round: 'Final',
    date: '2024-01-28',
    score: '6-3, 7-6, 6-3',
    winner: 1,
    prediction: {
      predictedWinner: 1,
      player1Chance: 65,
      player2Chance: 35,
      confidenceScore: 80,
      accurate: true,
    },
  },
  {
    id: 102,
    tournamentId: 1,
    player1Id: 1,
    player2Id: 2,
    round: 'Semi-final',
    date: '2024-01-26',
    score: '4-6, 6-4, 7-5, 6-3',
    winner: 2,
    prediction: {
      predictedWinner: 4,
      player1Chance: 45,
      player2Chance: 55,
      confidenceScore: 60,
      accurate: false,
    },
  },
  {
    id: 103,
    tournamentId: 1,
    player1Id: 2,
    player2Id: 3,
    round: 'Final',
    date: '2024-01-27',
    score: '6-2, 6-4',
    winner: 6,
    prediction: {
      predictedWinner: 6,
      player1Chance: 70,
      player2Chance: 30,
      confidenceScore: 85,
      accurate: true,
    },
  },
  {
    id: 104,
    tournamentId: 1,
    player1Id: 1,
    player2Id: 2,
    round: 'Semi-final',
    date: '2024-01-25',
    score: '4-6, 6-3, 4-6',
    winner: 6,
    prediction: {
      predictedWinner: 7,
      player1Chance: 55,
      player2Chance: 45,
      confidenceScore: 60,
      accurate: false,
    },
  },
]
// Model performance data
export const modelPerformance = {
  overallAccuracy: 76.2,
  surfaceAccuracy: {
    hard: 78.5,
    clay: 72.4,
    grass: 75.8,
  },
  tournamentAccuracy: {
    'Grand Slam': 80.3,
    'Masters 1000': 75.6,
    'ATP 500': 73.2,
    'ATP 250': 72.1,
  },
  monthlyAccuracy: [
    { month: 'Jan', accuracy: 78.2 },
    { month: 'Feb', accuracy: 76.5 },
    { month: 'Mar', accuracy: 75.8 },
    { month: 'Apr', accuracy: 77.3 },
    { month: 'May', accuracy: 74.1 },
    { month: 'Jun', accuracy: 79.2 },
    { month: 'Jul', accuracy: 80.5 },
    { month: 'Aug', accuracy: 76.8 },
    { month: 'Sep', accuracy: 75.3 },
    { month: 'Oct', accuracy: 74.9 },
    { month: 'Nov', accuracy: 76.1 },
    { month: 'Dec', accuracy: 77.5 },
  ],
}
// Helper function to get player by ID
export const getPlayerById = (id) => {
  return players.find((player) => player.id === id)
}
// Helper function to get tournament by ID
export const getTournamentById = (id) => {
  return tournaments.find((tournament) => tournament.id === id)
}
