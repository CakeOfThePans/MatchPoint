# MatchPoint Server

A Node.js/Express server with Prisma ORM for managing tennis match data, predictions, and results.

## Models

- **League**: Tennis tournaments and competitions
- **Match**: Individual tennis matches with team/player information
- **Score**: Match scoring details
- **Player**: Tennis player information and rankings
- **Result**: ML model predictions and actual results

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp env.example .env
   ```

3. Update the `.env` file with your database credentials:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/matchpoint_db"
   ```

4. Generate Prisma client:

   ```bash
   npm run db:generate
   ```

5. Push schema to database:
   ```bash
   npm run db:push
   ```

## Available Scripts

- `npm start` - Start the server
- `npm run dev` - Start with nodemon for development
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and apply migrations
- `npm run db:studio` - Open Prisma Studio

## API Endpoints

- `GET /health` - Health check and database connection test

## Database Schema

The database includes the following models with proper relationships:

- **League** ↔ **Match** (One-to-Many)
- **Match** ↔ **Score** (One-to-Many)
- **Match** ↔ **Result** (One-to-Many)
- **Player** ↔ **Result** (One-to-Many)

All models include timestamps and proper indexing for performance.

## Run

```bash
npm start
```

Server will run on the port specified in `.env` (default: 5000).

## Health Check

Visit [http://localhost:5000/api/health](http://localhost:5000/api/health) to check if the server is running.
