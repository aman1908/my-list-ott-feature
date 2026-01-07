# My List - OTT Platform Feature

A backend service for managing user's "My List" feature in an OTT (Over-The-Top) platform. Built with TypeScript, Express.js, MongoDB, and Redis for optimal performance.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- MongoDB 7 or higher
- Redis 7 or higher
- Docker (optional)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd my-list-ott-feature
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB and Redis**
```bash
# Using Docker
docker-compose up -d mongo redis

# OR install locally
# MongoDB: https://www.mongodb.com/docs/manual/installation/
# Redis: https://redis.io/docs/getting-started/installation/
```

5. **Seed sample data**
```bash
npm run seed
```

This will create:
- 4 sample users
- 8 sample movies
- 4 sample TV shows
- Sample list items

The script will output user IDs that you can use in the `x-user-id` header.

6. **Start the development server**
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Using Docker (Recommended)

Run the entire stack with Docker Compose:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

This starts:
- Application server on port 3000
- MongoDB on port 27017
- Redis on port 6379

### Seed Data with Docker

```bash
# Run seed script in container
docker-compose exec app npm run seed
```

## Running Tests

### Run all tests
```bash
npm test
```


## API Documentation

Base URL: `http://localhost:3000/api/v1`

### Authentication

All endpoints require the `x-user-id` header for user identification.

```bash
x-user-id: <user-id>
```

### Endpoints

#### 1. Add to My List

**POST** `/mylist`

Add a movie or TV show to the user's list.

**Request Body:**
```json
{
  "contentId": "507f1f77bcf86cd799439011",
  "contentType": "movie"  // or "tvshow"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Item added to your list successfully",
  "data": {
    "id": "...",
    "userId": "...",
    "contentId": "...",
    "contentType": "movie",
    "addedAt": "2023-12-17T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Invalid request or content type
- `401` - Missing authentication
- `404` - Content not found
- `409` - Item already in list

---

#### 2. Remove from My List

**DELETE** `/mylist/:contentId`

Remove an item from the user's list.

**Response (200):**
```json
{
  "success": true,
  "message": "Item removed from your list successfully"
}
```

**Error Responses:**
- `401` - Missing authentication
- `404` - Item not found in list

---

#### 3. Get My List

**GET** `/mylist?page=1&limit=20`

Retrieve user's list with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1, min: 1)
- `limit` (optional): Items per page (default: 20, min: 1, max: 100)

**Response (200):**
```json
{
  "success": true,
  "message": "My list retrieved successfully",
  "data": {
    "data": [
      {
        "id": "...",
        "userId": "...",
        "contentId": "...",
        "contentType": "movie",
        "addedAt": "2023-12-17T10:00:00.000Z",
        "content": {
          "id": "...",
          "title": "Movie Title",
          "description": "...",
          "genres": ["Action", "SciFi"],
          "releaseDate": "2023-01-01T00:00:00.000Z",
          "director": "...",
          "actors": ["..."]
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 50,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

#### 4. Check if in My List

**GET** `/mylist/check/:contentId`

Check if a specific item is in the user's list.

**Response (200):**
```json
{
  "success": true,
  "message": "Check completed",
  "data": {
    "inList": true
  }
}
```

---

#### 5. Get My List Count

**GET** `/mylist/count`

Get the total count of items in user's list.

**Response (200):**
```json
{
  "success": true,
  "message": "Count retrieved successfully",
  "data": {
    "count": 42
  }
}
```

---

#### 6. Health Check

**GET** `/health`

Check server health status.

**Response (200):**
```json
{
  "success": true,
  "message": "Server is healthy",
  "data": {
    "uptime": 12345.67,
    "timestamp": "2023-12-17T10:00:00.000Z",
    "redis": true
  }
}
```


## Deployment

### Docker Deployment

The application is containerized and ready for deployment on any container platform.

**Build and run:**
```bash
docker build -t my-list-ott .
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://your-mongo-host/ott-platform \
  -e REDIS_HOST=your-redis-host \
  my-list-ott
```

### CI/CD Pipeline

GitHub Actions pipeline (`.github/workflows/ci.yml`) includes:

1. **Test Stage**
   - Linting
   - Unit & integration tests
   - Coverage report

2. **Build Stage**
   - TypeScript compilation
   - Artifact generation

3. **Docker Stage** (on main branch)
   - Build Docker image
   - Push to Docker Hub
   - Versioned tags

### Environment Variables

Production environment variables:

```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://production-host/ott-platform
REDIS_HOST=production-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
CACHE_TTL=300
CACHE_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```


## API Testing

### Using cURL

```bash
# Get user ID from seed output, then:

# Add movie to list
curl -X POST http://localhost:3000/api/v1/mylist \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{"contentId": "MOVIE_ID", "contentType": "movie"}'

# Get my list
curl -X GET "http://localhost:3000/api/v1/mylist?page=1&limit=20" \
  -H "x-user-id: YOUR_USER_ID"

# Remove from list
curl -X DELETE http://localhost:3000/api/v1/mylist/CONTENT_ID \
  -H "x-user-id: YOUR_USER_ID"

# Check if in list
curl -X GET http://localhost:3000/api/v1/mylist/check/CONTENT_ID \
  -H "x-user-id: YOUR_USER_ID"

# Get count
curl -X GET http://localhost:3000/api/v1/mylist/count \
  -H "x-user-id: YOUR_USER_ID"
```

