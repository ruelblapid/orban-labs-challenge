# Search Notes

Searches the authenticated user's notes by tag and/or keyword. At least one of `tag` or `keyword` must be provided, otherwise the request is rejected with `422 Unprocessable Entity`.

---

**Query Parameters**

| Parameter | Description |
|-----------|-------------|
| `tag`     | Returns notes that have this exact tag. |
| `keyword` | Returns notes whose title or body contains this keyword. |

---

**Example — search by tag**
```
GET /notes/search?tag=work
Authorization: Bearer <access_token>
```

**Example — search by keyword**
```
GET /notes/search?keyword=sourdough
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
      "title": "Roadmap",
      "body": "Draft the Q3 roadmap",
      "tags": ["work"],
      "created_at": "2026-07-17T09:24:36.597282+00:00",
      "updated_at": "2026-07-17T09:24:36.597282+00:00"
    }
  ],
  "links": {},
  "timestamp": "2026-07-17T09:24:36.597282+00:00"
}
```

---

**Failed Response Example — no tag or keyword provided (`422 Unprocessable Entity`):**
```json
{
  "success": false,
  "error": {
    "message": "Provide a tag or keyword to search by",
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
