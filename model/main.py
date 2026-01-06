from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import os
import joblib

# Initialize FastAPI app
app = FastAPI()

# Get the directory where this script is located
current_dir = os.path.dirname(os.path.abspath(__file__))

# Load the model and feature names
try:
    primary_model_path = os.path.join(current_dir, "models", "primary_model.joblib")
    secondary_model_path = os.path.join(current_dir, "models", "secondary_model.joblib")
    tertiary_model_path = os.path.join(current_dir, "models", "tertiary_model.joblib")

    primary_model = joblib.load(primary_model_path)
    secondary_model = joblib.load(secondary_model_path)
    tertiary_model = joblib.load(tertiary_model_path)
except Exception as e:
    raise Exception(f"Error loading the models: {str(e)}")

def encode_surface(surface: str) -> list:
    """
    Convert surface string to one-hot encoded format
    Returns [surface_Clay, surface_Grass, surface_Hard] as floats (0.0 or 1.0)
    """
    surface_lower = surface.lower()
    return [
        1.0 if surface_lower == 'clay' else 0.0,  # surface_Clay
        1.0 if surface_lower == 'grass' else 0.0,  # surface_Grass
        1.0 if surface_lower == 'hard' else 0.0,  # surface_Hard
    ]

class PrimaryMatchInput(BaseModel):
    """
    Input data model for match prediction
    """

    surface: str
    p1_hand: float
    p2_hand: float
    p1_ht: float
    p2_ht: float
    p1_age: float
    p2_age: float
    p1_rank: float
    p2_rank: float
    p1_points: float
    p2_points: float
    p1_odds: float
    p2_odds: float


class SecondaryMatchInput(BaseModel):
    """
    Input data model for match prediction
    """

    surface: str
    p1_rank: float
    p2_rank: float
    p1_points: float
    p2_points: float
    p1_odds: float
    p2_odds: float

class TertiaryMatchInput(BaseModel):
    """
    Input data model for match prediction
    """
    surface: str
    p1_odds: float
    p2_odds: float


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


@app.post("/predict/primary", response_model=PredictionResponse)
async def predict_match_primary(match_data: PrimaryMatchInput):
    """
    Predict the outcome of a tennis match using all features
    """
    try:
        # Encode surface to one-hot format
        surface_encoded = encode_surface(match_data.surface)
        
        # Create feature array in the correct order (matching model training order)
        features = [
            *surface_encoded,  # surface_Clay, surface_Grass, surface_Hard
            match_data.p1_hand,
            match_data.p2_hand,
            match_data.p1_ht,
            match_data.p2_ht,
            match_data.p1_age,
            match_data.p2_age,
            match_data.p1_rank,
            match_data.p2_rank,
            match_data.p1_points,
            match_data.p2_points,
            match_data.p1_odds,
            match_data.p2_odds,
        ]

        # Reshape features into 2D array (1 sample, 16 features)
        features_array = np.array(features).reshape(1, -1)

        # Make prediction
        probabilities = primary_model.predict_proba(features_array)[0]

        return PredictionResponse(
            player1_win_probability=float(probabilities[0]),
            player2_win_probability=float(probabilities[1]),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/predict/secondary", response_model=PredictionResponse)
async def predict_match_secondary(match_data: SecondaryMatchInput):
    """
    Predict the outcome of a tennis match using surface, rank, points, and odds
    """
    try:
        # Encode surface to one-hot format
        surface_encoded = encode_surface(match_data.surface)
        
        # Create feature array in the correct order (matching model training order)
        features = [
            *surface_encoded,  # surface_Clay, surface_Grass, surface_Hard
            match_data.p1_rank,
            match_data.p2_rank,
            match_data.p1_points,
            match_data.p2_points,
            match_data.p1_odds,
            match_data.p2_odds,
        ]

        # Reshape features into 2D array (1 sample, 9 features)
        features_array = np.array(features).reshape(1, -1)

        # Make prediction using secondary model
        probabilities = secondary_model.predict_proba(features_array)[0]

        return PredictionResponse(
            player1_win_probability=float(probabilities[0]),
            player2_win_probability=float(probabilities[1]),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict/tertiary", response_model=PredictionResponse)
async def predict_match_tertiary(match_data: TertiaryMatchInput):
    """
    Predict the outcome of a tennis match using only surface and odds
    """
    try:
        # Encode surface to one-hot format
        surface_encoded = encode_surface(match_data.surface)
        
        # Create feature array in the correct order (matching model training order)
        features = [
            *surface_encoded,  # surface_Clay, surface_Grass, surface_Hard
            match_data.p1_odds,
            match_data.p2_odds,
        ]

        # Reshape features into 2D array (1 sample, 5 features)
        features_array = np.array(features).reshape(1, -1)

        # Make prediction using tertiary model
        probabilities = tertiary_model.predict_proba(features_array)[0]

        return PredictionResponse(
            player1_win_probability=float(probabilities[0]),
            player2_win_probability=float(probabilities[1]),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")