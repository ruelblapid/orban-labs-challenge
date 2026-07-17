# Create Note

Creates a new note owned by the authenticated user. `title` is required and must not be empty; `body` is required; `tags` is optional and defaults to an empty list.

---

**Endpoint**
```
POST /notes
Authorization: Bearer <access_token>
```

---

**Request Body Example:**
```json
{
  "title": "Groceries",
  "body": "Buy milk and eggs",
  "tags": ["home", "urgent"]
}
```

---

**Response Example (`201 Created`):**
```json
{
  "success": true,
  "message": "Note created",
  "data": {
    "id": "0d9c9f2e-4b7a-4e3a-9e1a-1a2b3c4d5e6f",
    "title": "Groceries",
    "body": "Buy milk and eggs",
    "tags": ["home", "urgent"],
    "created_at": "2026-07-17T09:24:36.597282+00:00",
    "updated_at": "2026-07-17T09:24:36.597282+00:00"
  },
  "timestamp": "2026-07-17T09:24:36.597282+00:00"
}
```

---

**Failed Response Example — empty title (`422 Unprocessable Entity`):**
```json
{
  "success": false,
  "error": {
    "message": "Title must not be empty",
    "code": "UNPROCESSABLE_ENTITY",
    "details": {
      "exception": null,
      "message": null
    }
  },
  "timestamp": "2026-07-17T09:24:36.597282+00:00"
}
```

See [Error Responses](../../../errors.md) for the full error envelope reference.
