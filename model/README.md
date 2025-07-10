# Tennis Match Prediction API

This FastAPI service provides tennis match outcome predictions using a trained XGBoost model.

## Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Run the API:

```bash
fastapi dev api/main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### GET /

Root endpoint that returns a welcome message

### POST /predict

Predicts the outcome of a tennis match

#### Input Format

```json
{
	"surface": 0, // 0: Hard, 1: Clay, 2: Grass
	"p1_rank": 1.0, // Player 1's ranking
	"p2_rank": 2.0, // Player 2's ranking
	"p1_points": 1000.0, // Player 1's points
	"p2_points": 900.0, // Player 2's points
	"p1_b365_odds": 1.5, // Player 1's betting odds
	"p2_b365_odds": 2.5 // Player 2's betting odds
}
```

#### Response Format

```json
{
	"player1_win_probability": 0.75,
	"player2_win_probability": 0.25,
	"predicted_winner": 0 // 0: Player 1 wins, 1: Player 2 wins
}
```

## Documentation

- Interactive API documentation is available at `/docs`
- Alternative documentation is available at `/redoc`
