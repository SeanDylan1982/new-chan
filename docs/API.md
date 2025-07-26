# NeoBoard API Documentation

This document provides detailed information about the NeoBoard REST API endpoints.

## Base URL

```
Development: http://localhost:3001/api
Production: https://your-api-domain.com/api
```

## Authentication

NeoBoard uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "string (required, 3-20 characters)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 characters)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "isAnonymous": false,
      "joinDate": "string",
      "postCount": 0
    },
    "token": "string"
  }
}
```

### Login User

**POST** `/auth/login`

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "isAnonymous": false,
      "joinDate": "string",
      "postCount": number
    },
    "token": "string"
  }
}
```

### Get Current User

**GET** `/auth/me`

Get the current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "isAnonymous": false,
      "joinDate": "string",
      "postCount": number
    }
  }
}
```

### Logout User

**POST** `/auth/logout`

Logout the current user (invalidate token).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Board Endpoints

### Get All Boards

**GET** `/boards`

Retrieve all boards with optional filtering.

**Query Parameters:**
- `category` (optional): Filter by board category
- `limit` (optional): Number of boards to return (default: 50)
- `offset` (optional): Number of boards to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "boards": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "category": "string",
        "threadCount": number,
        "postCount": number,
        "lastActivity": "string",
        "isNSFW": boolean
      }
    ],
    "total": number
  }
}
```

### Create Board

**POST** `/boards`

Create a new board (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "string (required, 3-50 characters)",
  "description": "string (required, max 500 characters)",
  "category": "string (required)",
  "isNSFW": "boolean (optional, default: false)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "board": {
      "id": "string",
      "name": "string",
      "description": "string",
      "category": "string",
      "threadCount": 0,
      "postCount": 0,
      "lastActivity": "string",
      "isNSFW": boolean
    }
  }
}
```

### Get Board Details

**GET** `/boards/:id`

Get detailed information about a specific board.

**Response:**
```json
{
  "success": true,
  "data": {
    "board": {
      "id": "string",
      "name": "string",
      "description": "string",
      "category": "string",
      "threadCount": number,
      "postCount": number,
      "lastActivity": "string",
      "isNSFW": boolean
    }
  }
}
```

### Update Board

**PUT** `/boards/:id`

Update board information (requires authentication and ownership).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "category": "string (optional)",
  "isNSFW": "boolean (optional)"
}
```

### Delete Board

**DELETE** `/boards/:id`

Delete a board (requires authentication and ownership).

**Headers:**
```
Authorization: Bearer <token>
```

## Thread Endpoints

### Get Threads

**GET** `/threads`

Retrieve threads with optional filtering.

**Query Parameters:**
- `boardId` (optional): Filter by board ID
- `limit` (optional): Number of threads to return (default: 20)
- `offset` (optional): Number of threads to skip (default: 0)
- `sortBy` (optional): Sort by 'createdAt', 'lastReply', 'replyCount' (default: 'lastReply')
- `order` (optional): 'asc' or 'desc' (default: 'desc')

**Response:**
```json
{
  "success": true,
  "data": {
    "threads": [
      {
        "id": "string",
        "boardId": "string",
        "title": "string",
        "content": "string",
        "author": {
          "id": "string",
          "username": "string",
          "isAnonymous": boolean
        },
        "createdAt": "string",
        "lastReply": "string",
        "replyCount": number,
        "isSticky": boolean,
        "isLocked": boolean,
        "images": ["string"],
        "tags": ["string"]
      }
    ],
    "total": number
  }
}
```

### Create Thread

**POST** `/threads`

Create a new thread (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `boardId`: string (required)
- `title`: string (required, 3-200 characters)
- `content`: string (required, max 10000 characters)
- `tags`: string (optional, comma-separated)
- `images`: file[] (optional, max 5 images, 10MB each)

**Response:**
```json
{
  "success": true,
  "data": {
    "thread": {
      "id": "string",
      "boardId": "string",
      "title": "string",
      "content": "string",
      "author": {
        "id": "string",
        "username": "string",
        "isAnonymous": boolean
      },
      "createdAt": "string",
      "lastReply": "string",
      "replyCount": 0,
      "isSticky": false,
      "isLocked": false,
      "images": ["string"],
      "tags": ["string"]
    }
  }
}
```

### Get Thread Details

**GET** `/threads/:id`

Get detailed information about a specific thread including posts.

**Query Parameters:**
- `limit` (optional): Number of posts to return (default: 50)
- `offset` (optional): Number of posts to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "thread": {
      "id": "string",
      "boardId": "string",
      "title": "string",
      "content": "string",
      "author": {
        "id": "string",
        "username": "string",
        "isAnonymous": boolean
      },
      "createdAt": "string",
      "lastReply": "string",
      "replyCount": number,
      "isSticky": boolean,
      "isLocked": boolean,
      "images": ["string"],
      "tags": ["string"]
    },
    "posts": [
      {
        "id": "string",
        "threadId": "string",
        "content": "string",
        "author": {
          "id": "string",
          "username": "string",
          "isAnonymous": boolean
        },
        "createdAt": "string",
        "replyTo": "string",
        "images": ["string"],
        "isOP": boolean
      }
    ]
  }
}
```

### Update Thread

**PUT** `/threads/:id`

Update thread information (requires authentication and ownership).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "string (optional)",
  "content": "string (optional)",
  "tags": ["string"] (optional),
  "isSticky": "boolean (optional, admin only)",
  "isLocked": "boolean (optional, admin only)"
}
```

### Delete Thread

**DELETE** `/threads/:id`

Delete a thread (requires authentication and ownership).

**Headers:**
```
Authorization: Bearer <token>
```

## Post Endpoints

### Get Posts

**GET** `/posts`

Retrieve posts with optional filtering.

**Query Parameters:**
- `threadId` (required): Filter by thread ID
- `limit` (optional): Number of posts to return (default: 50)
- `offset` (optional): Number of posts to skip (default: 0)
- `sortBy` (optional): Sort by 'createdAt' (default: 'createdAt')
- `order` (optional): 'asc' or 'desc' (default: 'asc')

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "string",
        "threadId": "string",
        "content": "string",
        "author": {
          "id": "string",
          "username": "string",
          "isAnonymous": boolean
        },
        "createdAt": "string",
        "replyTo": "string",
        "images": ["string"],
        "isOP": boolean
      }
    ],
    "total": number
  }
}
```

### Create Post

**POST** `/posts`

Create a new post in a thread.

**Headers:**
```
Authorization: Bearer <token> (optional for anonymous posts)
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `threadId`: string (required)
- `content`: string (required, max 10000 characters)
- `replyTo`: string (optional, post ID to reply to)
- `images`: file[] (optional, max 5 images, 10MB each)

**Response:**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "string",
      "threadId": "string",
      "content": "string",
      "author": {
        "id": "string",
        "username": "string",
        "isAnonymous": boolean
      },
      "createdAt": "string",
      "replyTo": "string",
      "images": ["string"],
      "isOP": false
    }
  }
}
```

### Update Post

**PUT** `/posts/:id`

Update post content (requires authentication and ownership).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "string (required, max 10000 characters)"
}
```

### Delete Post

**DELETE** `/posts/:id`

Delete a post (requires authentication and ownership).

**Headers:**
```
Authorization: Bearer <token>
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `SERVER_ERROR` | Internal server error |

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 login attempts per 15 minutes per IP
- **File Upload**: 10 uploads per hour per user

## File Upload

### Supported Formats
- Images: JPEG, PNG, GIF, WebP
- Maximum file size: 10MB per file
- Maximum files per request: 5

### Image Processing
- Automatic compression for large images
- Thumbnail generation
- EXIF data removal for privacy

## Webhooks (Future Feature)

NeoBoard will support webhooks for real-time notifications:

- New thread created
- New post in subscribed thread
- User mentioned
- Board activity updates

## SDK and Libraries

Official SDKs will be available for:

- JavaScript/TypeScript
- Python
- PHP
- Go

## Support

For API support and questions:

- Documentation: [API Docs](./API.md)
- Issues: [GitHub Issues](../../issues)
- Email: api-support@neoboard.com