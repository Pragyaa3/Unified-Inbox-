# Unified Inbox API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

Most endpoints require authentication using JWT tokens.
```bash
Authorization: Bearer <token>
```

Get token from `/api/auth/login` endpoint.

---

## Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

#### POST `/api/auth/login`
Login and get JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

#### GET `/api/auth/verify`
Verify JWT token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "...",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "ADMIN"
  }
}
```

---

### Contacts

#### GET `/api/contacts`
Get all contacts.

**Query Parameters:**
- `limit` (number): Max contacts to return (default: 50)
- `search` (string): Search by name, email, or phone

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "name": "Alice Johnson",
      "phone": "+1234567890",
      "email": "alice@example.com",
      "whatsapp": "+1234567890",
      "tags": ["customer", "vip"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "messages": [...]
    }
  ]
}
```

#### POST `/api/contacts`
Create a new contact.

**Request:**
```json
{
  "name": "Alice Johnson",
  "phone": "+1234567890",
  "email": "alice@example.com",
  "whatsapp": "+1234567890",
  "tags": ["customer"]
}
```

#### PATCH `/api/contacts/:id`
Update a contact.

#### DELETE `/api/contacts/:id`
Delete a contact.

---

### Messages

#### GET `/api/messages`
Get messages for a contact.

**Query Parameters:**
- `contactId` (required): Contact ID
- `limit` (number): Max messages to return (default: 100)

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "contactId": "...",
      "channel": "SMS",
      "direction": "INBOUND",
      "status": "DELIVERED",
      "content": "Hello!",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/messages`
Send a message.

**Request:**
```json
{
  "contactId": "...",
  "channel": "SMS",
  "content": "Hello, how can I help?",
  "scheduledFor": "2024-01-01T12:00:00.000Z" // optional
}
```

---

### Notes

#### GET `/api/notes`
Get notes for a contact.

**Query Parameters:**
- `contactId` (required): Contact ID

#### POST `/api/notes`
Create a note.

**Request:**
```json
{
  "contactId": "...",
  "content": "Customer is interested in premium plan",
  "isPrivate": false
}
```

#### PATCH `/api/notes/:id`
Update a note.

#### DELETE `/api/notes/:id`
Delete a note.

---

### Analytics

#### GET `/api/analytics`
Get analytics data.

**Query Parameters:**
- `days` (number): Number of days to include (default: 7)
- `channel` (string): Filter by channel (optional)

**Response:**
```json
{
  "data": [...],
  "totals": {
    "messagesSent": 150,
    "messagesReceived": 120,
    "avgResponseTime": 45,
    "uniqueContacts": 30,
    "conversions": 5
  }
}
```

#### GET `/api/analytics/summary`
Get dashboard summary.

---

### Webhooks

#### POST `/api/webhooks/twilio`
Twilio webhook endpoint for incoming SMS/WhatsApp messages.

**Note:** This endpoint is called automatically by Twilio.

---

## Error Responses

All endpoints return errors in this format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {...}  // optional
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid auth)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error