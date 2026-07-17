# Delete Note

Permanently deletes a note by its id. On success, no response body is returned.

---

**Endpoint**
```
DELETE /notes/{note_id}
Authorization: Bearer <access_token>
```

---

**Response Example (`204 No Content`):**

No body is returned.

---

**Failed Response Example — note not found or already deleted (`404 Not Found`):**
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
