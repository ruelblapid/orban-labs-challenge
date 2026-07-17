# Register

Creates a new user account with an email and password. Passwords must be at least 8 characters. If the email is already registered, the request is rejected with `409 Conflict`.

---

**Endpoint**
```
POST /auth/register
```

---

**Request Body Example:**
```json
{
  "email": "new.user@example.com",
  "password": "Sup3rSecret!"
}
```

---

**Response Example (`201 Created`):**
```json
{
  "success": true,
  "message": "User registered",
  "data": {
    "id": "aa43f52b-7061-4036-84b1-076a1de06105",
    "email": "new.user@example.com",
    "created_at": "2026-07-17T09:24:36.597282+00:00"
  },
  "timestamp": "2026-07-17T09:24:36.597282+00:00"
}
```

---

**Failed Response Example — email already registered (`409 Conflict`):**
```json
{
  "success": false,
  "error": {
    "message": "Email is already registered",
    "code": "CONFLICT",
    "details": {
      "exception": null,
      "message": null
    }
  },
  "timestamp": "2026-07-17T09:24:36.597282+00:00"
}
```

See [Error Responses](../../../errors.md) for the full error envelope reference.
