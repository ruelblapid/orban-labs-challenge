# Update Note

Partially updates a note. Only the fields provided in the request body are changed; omitted fields keep their current value. If `title` is provided, it must not be empty.

---

**Endpoint**
```
PUT /notes/{note_id}
Authorization: Bearer <access_token>
```

---

**Request Body Example:**
```json
{
  "title": "New title"
}
```

---

**Response Example (`200 OK`):**
```json
{
  "success": true,
  "message": "Note updated",
  "data": {
    "id": "0d9c9f2e-4b7a-4e3a-9e1a-1a2b3c4d5e6f",
    "title": "New title",
    "body": "Body text",
    "tags": ["misc"],
    "created_at": "2026-07-17T09:24:36.597282+00:00",
    "updated_at": "2026-07-17T09:30:12.101922+00:00"
  },
  "timestamp": "2026-07-17T09:30:12.101922+00:00"
}
```

---

**Failed Response Example — note not found (`404 Not Found`):**
```json
{
  "success": false,
  "error": {
    "message": "Note not found",
    "code": "NOT_FOUND",
    "details": {
      "exception": null,
      "message": null
    }
  },
  "timestamp": "2026-07-17T09:24:36.597282+00:00"
}
```

See [Error Responses](../../../errors.md) for the full error envelope reference.
