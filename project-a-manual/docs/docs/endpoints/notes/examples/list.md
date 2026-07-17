# List Notes

Retrieves the authenticated user's notes with pagination.

---

**Query Parameters**

| Parameter | Default | Description |
|-----------|---------|-------------|
| `limit`   | `100`   | Maximum number of notes to return. Must be between 1 and 500. |
| `offset`  | `0`     | Number of notes to skip before collecting the result set. |

---

**Endpoint**
```
GET /notes?limit=100&offset=0
Authorization: Bearer <access_token>
```

---

**Response Example (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "0d9c9f2e-4b7a-4e3a-9e1a-1a2b3c4d5e6f",
      "title": "Standup notes",
      "body": "Discuss sprint goals",
      "tags": ["work"],
      "created_at": "2026-07-17T09:24:36.597282+00:00",
      "updated_at": "2026-07-17T09:24:36.597282+00:00"
    }
  ],
  "links": {
    "total": 1,
    "limit": 100,
    "offset": 0
  },
  "timestamp": "2026-07-17T09:24:36.597282+00:00"
}
```

`links.total` is the total number of notes owned by the user, independent of `limit`/`offset` — use it to compute page count (`ceil(total / limit)`) for pagination.
