# Idempotent Submission Handler

A Node.js API that safely handles duplicate submissions using **Redis** as an idempotency key store.

## 🧠 How It Works

When a client sends a `POST /submit` request with an `Idempotency-Key` header:

1. **First request** → Processes the submission, stores the result in Redis for 60 seconds, returns `"cached": false`
2. **Same request again (within 60s)** → Finds the key in Redis, skips processing, returns cached result with `"cached": true`
3. **After 60 seconds** → The key expires, the next request is treated as fresh

```
Request + Idempotency-Key
        │
        ▼
   Check Redis
        │
   Key exists? ──YES──► Return cached response ("cached": true)
        │
        NO
        │
        ▼
   Process request
        │
   Store in Redis (TTL: 60s)
        │
        ▼
   Return fresh response ("cached": false)
```

## 🚀 Quick Start (with Docker)

```bash
# Clone the repo
git clone <your-repo-url>
cd idempotent-submission-handler

# Start the app and Redis together
docker compose up
```

App runs at: `http://localhost:3000`

## 🧪 Testing

**First submission (fresh):**
```bash
curl -X POST http://localhost:3000/submit \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-key-001" \
  -d '{"name": "Alice", "amount": 100}'
```
Response: `"cached": false`

**Same request again (duplicate):**
```bash
curl -X POST http://localhost:3000/submit \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-key-001" \
  -d '{"name": "Alice", "amount": 100}'
```
Response: `"cached": true` ✅ — No double processing!

**Missing key (error):**
```bash
curl -X POST http://localhost:3000/submit \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob"}'
```
Response: `400 Bad Request` — Idempotency-Key header is required

## 📁 Project Structure

```
├── src/
│   ├── index.js          # Express server entry point
│   ├── redisClient.js    # Redis connection using ioredis
│   └── routes/
│       └── submit.js     # POST /submit — idempotency logic
├── .env                  # Environment variables
├── .dockerignore         # Exclude files from Docker build
├── Dockerfile            # Build the Node.js container
├── docker-compose.yml    # Run app + Redis together
└── package.json          # Project dependencies
```

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_URL` | `redis://redis:6379` | Redis connection URL |
| `TTL_SECONDS` | `60` | How long to cache idempotency keys |
| `PORT` | `3000` | Port for the Express server |

## 🛠️ Tech Stack

- **Node.js** — Runtime
- **Express** — Web framework
- **Redis** — Idempotency key store (`SET key value NX EX`)
- **ioredis** — Redis client for Node.js
- **Docker + Docker Compose** — Containerization
