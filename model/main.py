from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import os

# Initialize FastAPI app
app = FastAPI()

# Get the directory where this script is located
current_dir = os.path.dirname(os.path.abspath(__file__))

# Load the model and feature names
try:
    model_path = os.path.join(current_dir, "models", "tennis_model.joblib")
    model2_path = os.path.join(current_dir, "models", "tennis_model2.joblib")

    model = joblib.load(model_path)
    model2 = joblib.load(model2_path)
except Exception as e:
    raise Exception(f"Error loading the model: {str(e)}")


class MatchInput(BaseModel):
    """
    Input data model for match prediction
    """

    surface: int  # 0: Hard, 1: Clay, 2: Grass
    p1_rank: float
    p2_rank: float
    p1_points: float
    p2_points: float
    p1_b365_odds: float
    p2_b365_odds: float


class OddsOnlyMatchInput(BaseModel):
    """
    Input data model for odds-only match prediction
    """

    surface: int  # 0: Hard, 1: Clay, 2: Grass
    p1_b365_odds: float
    p2_b365_odds: float


class PredictionResponse(BaseModel):
    """
    Response model for predictions
    """

    player1_win_probability: float
    player2_win_probability: float


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Tennis Match Prediction API"}


@app.post("/predict", response_model=PredictionResponse)
async def predict_match(match_data: MatchInput):
    """
    Predict the outcome of a tennis match using all features
    """
    try:
        # Create feature array in the correct order
        features = [
            match_data.surface,
            match_data.p1_rank,
            match_data.p2_rank,
            match_data.p1_points,
            match_data.p2_points,
            match_data.p1_b365_odds,
            match_data.p2_b365_odds,
        ]

        # Reshape features into 2D array (1 sample, 7 features)
        features_array = np.array(features).reshape(1, -1)

        # Make prediction
        probabilities = model.predict_proba(features_array)[0]

        return PredictionResponse(
            player1_win_probability=float(probabilities[0]),
            player2_win_probability=float(probabilities[1]),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/predict/odds-only", response_model=PredictionResponse)
async def predict_match_odds_only(match_data: OddsOnlyMatchInput):
    """
    Predict the outcome of a tennis match using only surface and odds
    """
    try:
        # Create feature array in the correct order
        features = [
            match_data.surface,
            match_data.p1_b365_odds,
            match_data.p2_b365_odds,
        ]

        # Reshape features into 2D array (1 sample, 3 features)
        features_array = np.array(features).reshape(1, -1)

        # Make prediction using model2
        probabilities = model2.predict_proba(features_array)[0]

        return PredictionResponse(
            player1_win_probability=float(probabilities[0]),
            player2_win_probability=float(probabilities[1]),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
