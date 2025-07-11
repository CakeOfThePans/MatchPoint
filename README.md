# MatchPoint - Tennis Match Prediction Platform

MatchPoint is a comprehensive tennis match prediction platform that combines machine learning models with a modern web application to predict tennis match outcomes. The project consists of three main components: a React frontend, a Node.js backend API, and a Python FastAPI machine learning service.

## 🏗️ Project Structure

```
MatchPoint/
├── client/          # React frontend application
├── server/          # Node.js backend API
├── model/           # Python FastAPI ML service
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**
- **PostgreSQL** (for database)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MatchPoint
```

### 2. Set Up the Backend Server

```bash
cd server
npm install
```

Create a `.env` file in the server directory:

```env
# Database connection string for PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/matchpoint"

# Machine Learning API service URL (default: http://localhost:8000)
ML_API_URL="http://localhost:8000"

# Server port (default: 5000)
PORT=5000

# SportDevs API keys for tennis data (multiple keys for rate limiting, but feel free to use the same key for all 3)
# The keys must be in the format of "Bearer API_KEY"
SPORTDEVS_API_KEY1="your_sportdevs_api_key_1"
SPORTDEVS_API_KEY2="your_sportdevs_api_key_2"
SPORTDEVS_API_KEY3="your_sportdevs_api_key_3"
```

Set up the database:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Seed the database with initial data
npm run db:seed:players
# Include the start and end dates in YYYY-MM-DD format
npm run db:seed:matches startDate endDate
# Do note that some matches may not contain match odds which will cause errors
# In that case you may have to manually update the odds in the database
# If you choose to do so, you can update match predictions afterwards with this:
npm run update:predictions startDate endDate
```

Start the server:

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

### 3. Set Up the Machine Learning Service

```bash
cd model

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Start the ML service:

```bash
# Start FastAPI server
uvicorn main:app --reload --port 8000
```

The ML service will run on `http://localhost:8000`

### 4. Set Up the Frontend Client

```bash
cd client
npm install
```

Optional: Create a `.env` file in the client directory:

```env
# Backend API base URL
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

The client will run on `http://localhost:5173`

### 🚀 Quick Start (Alternative Method)

**Optionally, you can start all services at once from the root directory:**

After setting up all the environment files and installing dependencies in each directory, you can run:

```bash
# From the root directory, start all services concurrently
npm run dev
```

This will start:

- Backend server on `http://localhost:5000`
- Frontend client on `http://localhost:5173`
- ML service on `http://localhost:8000`

**Note:** Make sure you have completed the setup steps for all three components (server, client, and model) before using this command.

## 📁 Component Details

### 🔧 Backend (Server)

The Node.js backend provides:

- **Express.js** REST API
- **Prisma** ORM with PostgreSQL
- **CORS** enabled for frontend integration
- **Cron jobs** for automated data updates

**Key Features:**

- Player management and statistics
- Match data and results
- League and tournament management
- ML result integration
- Automated data updates via cron jobs
- **External API Integration** - Real-time tennis data from SportDevs API

**Available Scripts:**

- `npm run dev` - Start with nodemon
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed:players` - Seed player data
- `npm run db:seed:matches` - Seed match data given a start and end date
- `npm run update:predictions` - Update predictions given a start and end date

**Cron Jobs:**

The server includes automated cron jobs that run periodically:

- **Daily updates** - Fetches latest player rankings, leagues, matches, match odds, and predictions
- **Hourly updates** - Fetches latest match statistics, predictions, and updates ML results

### 🤖 Machine Learning Service (Model)

The Python FastAPI service provides:

- **FastAPI** REST API
- **Scikit-learn** and **XGBoost** models
- **Joblib** for model serialization
- **Pandas** and **NumPy** for data processing

**Key Features:**

- Tennis match outcome predictions
- Two prediction models:
  - Full-feature model (surface, rankings, points, odds)
  - Odds-only model (surface and betting odds)

**API Endpoints:**

- `GET /` - Health check
- `POST /predict` - Full-feature prediction
- `POST /predict/odds-only` - Odds-only prediction

### 🎯 Frontend (Client)

The React frontend is built with:

- **React 19** with Vite
- **TailwindCSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons

**Key Features:**

- Home page with tournament overview
- Match predictions with ML integration
- Live results and rankings
- Player statistics and profiles

**Available Scripts:**

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔄 Data Flow

1. **Frontend** → Makes API calls to **Backend**
2. **Backend** → Processes requests and manages database
3. **Backend** → Calls **ML Service** for predictions
4. **ML Service** → Returns prediction results
5. **Backend** → Returns processed data to **Frontend**

## 🌐 External API Integration

The application integrates with **SportDevs API** to fetch live tennis data:

- **League Information** - League/tournament details
- **Live Match Results** - Real-time match outcomes
- **Player Rankings** - Current ATP rankings and points
- **Betting Odds** - Live match odds for prediction models

The API integration ensures the platform always has the most current and accurate tennis data for predictions and analysis.

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:

- **Leagues** - Tournament and league information
- **Matches** - Match data and results
- **Players** - Tennis player information and statistics
- **MLResultOverall** - Machine learning prediction results overall
- **MLResultsByLeague** - Machine learning prediction results per league

## 🔧 Environment Variables

### Server (.env)

```env
# Database connection string for PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/matchpoint"

# Machine Learning API service URL (default: http://localhost:8000)
ML_API_URL="http://localhost:8000"

# Server port (default: 5000)
PORT=5000

# SportDevs API keys for tennis data (multiple keys for rate limiting, but feel free to use the same key for all 3)
# The keys must be in the format of "Bearer API_KEY"
SPORTDEVS_API_KEY1="your_sportdevs_api_key_1"
SPORTDEVS_API_KEY2="your_sportdevs_api_key_2"
SPORTDEVS_API_KEY3="your_sportdevs_api_key_3"
```

### Client (.env)

```env
# Backend API base URL
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Deployment

### Frontend Deployment

```bash
cd client
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend and ML Service Deployment

**Option 1: Deploy individually**

```bash
# Backend Deployment
cd server
npm install
npm start

# ML Service Deployment
cd model
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Option 2: Deploy together from root directory**

```bash
# From the root directory, start backend and ML service concurrently
npm run start
```

This will start:

- Backend server on the configured port (default: 5000)
- ML service on port 8000

**Note:** The frontend must still be deployed statically by building it and serving the `dist/` folder from your hosting service.
