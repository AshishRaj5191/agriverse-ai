# AgriVerse AI - Day 1 Foundation

AgriVerse AI is an MCA major project prototype for building an intelligent agriculture ecosystem. This Day 1 setup includes only project foundation: monorepo structure, frontend base, backend base, MongoDB config, and authentication foundation.

## Day 1 Scope
- Monorepo structure (`frontend`, `backend`, `ai-service`, `docs`)
- React + Vite + Tailwind frontend foundation
- Basic responsive pages: Home, Login, Register
- Express backend foundation with modular structure
- MongoDB connection module using `MONGODB_URI`
- Health endpoint: `GET /api/v1/health`
- Auth foundation: User model, register/login APIs, bcrypt hashing, JWT setup
- Auth and role middleware foundations

No AI, weather, marketplace, expert consultation, recommendations, or voice modules are implemented on Day 1.

## Prerequisites
- Node.js 20+
- npm 10+
- MongoDB Community Server (local) or MongoDB Atlas URI
- Git

## Project Structure

```text
agriverse-ai/
  frontend/
  backend/
  ai-service/
  docs/
  README.md
  .gitignore
```

## Environment Variables

### Backend
1. Copy `backend/.env.example` to `backend/.env`
2. Update values:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/agriverse_ai
JWT_SECRET=replace_with_secure_jwt_secret
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
```

### Frontend
1. Copy `frontend/.env.example` to `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### AI Service
Day 1 only includes placeholder env file:
- `ai-service/.env.example`

## Installation
From project root:

```bash
cd frontend
npm install
cd ../backend
npm install
```

## MongoDB Setup
### Local MongoDB
1. Install MongoDB Community Server.
2. Ensure MongoDB service is running on default port `27017`.
3. Use `MONGODB_URI=mongodb://127.0.0.1:27017/agriverse_ai`.

### MongoDB Atlas
1. Create a cluster.
2. Create a database user.
3. Allow your IP in Network Access.
4. Put Atlas connection string in `MONGODB_URI`.

Note: Backend is configured to continue starting even if MongoDB is temporarily unavailable. It logs the DB error clearly.

## Run Frontend

```bash
cd frontend
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Run Backend

```bash
cd backend
npm run dev
```

Backend default URL: `http://localhost:5000`

## Test Health Endpoint

```bash
curl http://localhost:5000/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "message": "AgriVerse AI backend is running.",
  "timestamp": "2026-..."
}
```

## Test Register API

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Farmer","email":"farmer@example.com","password":"secret123","role":"farmer"}'
```

## Test Login API

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer@example.com","password":"secret123"}'
```

Both responses return a JWT token under `data.token`.

## Frontend Auth Pages
- `/login` calls backend login API
- `/register` calls backend register API
- On login success, token is stored in `localStorage` key `agriverse_token` for Day 1 testing

## Security Notes (Day 1)
- Passwords are stored as bcrypt hashes (`passwordHash`)
- JWT issued by backend
- Basic auth middleware and role authorization middleware added
- Env variables used for secrets and config

## Next Steps (Day 2+)
- Role-based protected frontend routes
- Farmer profile module
- Farm details module
- Additional validation and testing
