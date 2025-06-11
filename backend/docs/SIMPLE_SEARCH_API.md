# Simple Team Search API Documentation

## Overview
This document describes the Simple Team Search API endpoints that provide basic, reliable search functionality for teams and team members without complex features that might cause errors.

## Base URL
```
http://localhost:5000/api/teams-simple
```

## Authentication
All endpoints require authentication. Include the authorization token in the request headers:
```
Authorization: Bearer <your-auth-token>
```

## Rate Limiting
- **Limit**: 30 requests per minute per IP address
- **Response Headers**: `X-RateLimit-*` headers included in responses

---

## Endpoints

### 1. Health Check
**GET** `/health`

Check if the Simple Team Search API is running.

**Response:**
```json
{
  "status": "success",
  "message": "Simple Team Search API is running",
  "timestamp": "2025-05-31T08:49:18.411Z",
  "features": [
    "Simple team search by name",
    "Simple member search in team",
    "Basic rate limiting",
    "Fast response times"
  ]
}
```

---

### 2. Search Teams by Name
**GET** `/search`

Search for teams by name using case-insensitive partial matching.

**Query Parameters:**
- `name` (required): Team name to search for

**Example Request:**
```
GET /api/teams-simple/search?name=Test Team
```

**Example Response:**
```json
{
  "success": true,
  "message": "Teams found successfully",
  "data": [
    {
      "_id": "60f7b1234567890abcdef123",
      "name": "Test Team 1",
      "description": "A test team for development",
      "createdAt": "2025-05-31T08:00:00.000Z",
      "updatedAt": "2025-05-31T08:00:00.000Z"
    }
  ],
  "count": 1,
  "searchQuery": "Test Team"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Team name is required for search"
}
```

---

### 3. Search Members in Team
**GET** `/:teamId/members/search`

Search for members within a specific team by name or email.

**Path Parameters:**
- `teamId` (required): MongoDB ObjectId of the team

**Query Parameters:**
- `query` (required): Search term for member name or email

**Example Request:**
```
GET /api/teams-simple/60f7b1234567890abcdef123/members/search?query=john
```

**Example Response:**
```json
{
  "success": true,
  "message": "Members found successfully",
  "data": [
    {
      "_id": "60f7b1234567890abcdef456",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "member",
      "joinedAt": "2025-05-31T08:00:00.000Z"
    }
  ],
  "count": 1,
  "teamId": "60f7b1234567890abcdef123",
  "searchQuery": "john"
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Search query is required"
}
```

```json
{
  "success": false,
  "message": "Invalid team ID"
}
```

```json
{
  "success": false,
  "message": "Team not found"
}
```

---

## Error Codes

| HTTP Status | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Missing required parameters or invalid input |
| 401 | Unauthorized | Invalid or missing authentication token |
| 404 | Not Found | Team not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## Usage Examples

### Using curl

1. **Health Check:**
```bash
curl -X GET "http://localhost:5000/api/teams-simple/health" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

2. **Search Teams:**
```bash
curl -X GET "http://localhost:5000/api/teams-simple/search?name=Test" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Search Members:**
```bash
curl -X GET "http://localhost:5000/api/teams-simple/TEAM_ID/members/search?query=john" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using JavaScript/Fetch

```javascript
// Search teams
const searchTeams = async (searchName) => {
  const response = await fetch(`/api/teams-simple/search?name=${encodeURIComponent(searchName)}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

// Search members in team
const searchMembers = async (teamId, query) => {
  const response = await fetch(`/api/teams-simple/${teamId}/members/search?query=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};
```

---

## Features

✅ **Simple & Reliable**: Basic search functionality without complex features  
✅ **Fast Response**: Optimized queries for quick results  
✅ **Rate Limited**: Protection against API abuse  
✅ **Well Tested**: Comprehensive test coverage  
✅ **Error Handling**: Proper validation and error messages  
✅ **Case Insensitive**: Flexible search matching  

---

## Notes

- This API is designed to be simple and reliable, avoiding complex features that might cause errors
- Search is case-insensitive and supports partial matching
- Rate limiting is implemented to prevent abuse
- All endpoints require proper authentication
- Response format is consistent across all endpoints

---

## Testing

Run the test suite:
```bash
node test_simple_search.js
```

Or use the interactive test menu:
```bash
node test/test_teams.js
# Select options 30, 31, or 32 for simple search testing
```
