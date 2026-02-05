# Unity Vote API Documentation

## Base URL
`/api`

## Authentication
Currently, contestant and contest endpoints are public. Admin endpoints require authentication (implement middleware as needed).

---

## Contests

### List All Contests
```
GET /api/contests
```

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `upcoming`, `ended`, `paused`)
- `includeContestants` (optional): Include contestant data (`true`/`false`)

**Response:**
```json
[
  {
    "id": "c1",
    "title": "Unity Summit & Awards 2026",
    "description": "...",
    "startDate": "2026-01-01T00:00:00.000Z",
    "endDate": "2026-12-31T00:00:00.000Z",
    "status": "active",
    "bannerUrl": "https://...",
    "_count": {
      "contestants": 10,
      "votes": 5432
    }
  }
]
```

### Get Single Contest
```
GET /api/contests/[id]
```

**Query Parameters:**
- `includeWithdrawn` (optional): Include withdrawn contestants (`true`/`false`)

**Response:**
```json
{
  "id": "c1",
  "title": "Unity Summit & Awards 2026",
  "contestants": [...],
  "_count": {
    "contestants": 10,
    "votes": 5432
  }
}
```

### Create Contest
```
POST /api/contests
```

**Body:**
```json
{
  "title": "Contest Name",
  "description": "Contest description",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "bannerUrl": "https://...",
  "status": "upcoming"
}
```

### Update Contest
```
PATCH /api/contests/[id]
```

**Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "status": "active"
}
```

### Delete Contest
```
DELETE /api/contests/[id]
```

---

## Contestants

### List All Contestants
```
GET /api/contestants
```

**Query Parameters:**
- `contestId` (optional): Filter by contest ID
- `category` (optional): Filter by category
- `status` (optional): Filter by status (`active`, `withdrawn`)
- `isVisible` (optional): Filter by visibility (`true`, `false`)

**Response:**
```json
[
  {
    "id": "p1",
    "name": "Sarah Chen",
    "bio": "...",
    "category": "Brobyggerprisen 2026",
    "photoUrl": "https://...",
    "votes": 1240,
    "linkedinUrl": "#",
    "isVisible": true,
    "status": "active",
    "email": "sarah.chen@example.com",
    "contestId": "c1",
    "contest": {
      "id": "c1",
      "title": "Unity Summit & Awards 2026",
      "status": "active"
    }
  }
]
```

### Get Single Contestant
```
GET /api/contestants/[id]
```

**Response:**
```json
{
  "id": "p1",
  "name": "Sarah Chen",
  "voteRecords": [
    {
      "id": "v1",
      "timestamp": "2026-02-01T10:30:00.000Z"
    }
  ]
}
```

### Create Contestant
```
POST /api/contestants
```

**Body:**
```json
{
  "name": "Jane Doe",
  "bio": "Biography text...",
  "category": "Award Category",
  "photoUrl": "https://...",
  "email": "jane@example.com",
  "contestId": "c1",
  "linkedinUrl": "https://linkedin.com/in/...",
  "isVisible": true,
  "status": "active"
}
```

### Update Contestant
```
PATCH /api/contestants/[id]
```

**Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "bio": "Updated bio",
  "isVisible": false,
  "status": "withdrawn"
}
```

### Delete Contestant
```
DELETE /api/contestants/[id]
```

---

## Votes

### Cast Vote
```
POST /api/votes
```

**Body:**
```json
{
  "email": "voter@example.com",
  "contestantId": "p1",
  "contestId": "c1",
  "ipAddress": "192.168.1.1"
}
```

**Response:**
```json
{
  "message": "Vote recorded. Please verify via OTP.",
  "voteId": "v123"
}
```

### Verify Vote
```
PATCH /api/votes/[id]/verify
```

**Body:**
```json
{
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Vote verified successfully",
  "vote": { ... }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## Database Models

### Contest
- `id`: String (CUID)
- `title`: String
- `description`: String
- `startDate`: DateTime
- `endDate`: DateTime
- `status`: String (active, upcoming, ended, paused)
- `bannerUrl`: String
- `contestants`: Contestant[]
- `votes`: Vote[]

### Contestant
- `id`: String (CUID)
- `name`: String
- `bio`: Text
- `category`: String
- `photoUrl`: String
- `votes`: Integer
- `linkedinUrl`: String (optional)
- `isVisible`: Boolean
- `status`: String (active, withdrawn)
- `email`: String
- `contestId`: String
- `contest`: Contest
- `voteRecords`: Vote[]

### Vote
- `id`: String (CUID)
- `email`: String
- `contestantId`: String
- `contestId`: String
- `timestamp`: DateTime
- `status`: String (pending, verified, rejected)
- `ipAddress`: String (optional)
- Unique constraint: (email, contestId)

---

## Next Steps

1. **Run Migration:**
   ```bash
   npx prisma migrate dev
   ```

2. **Seed Database:**
   ```bash
   npx prisma db seed
   ```

3. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

5. **Test Endpoints:**
   - Use Postman, Thunder Client, or curl
   - Check `/api/contests` to verify setup
