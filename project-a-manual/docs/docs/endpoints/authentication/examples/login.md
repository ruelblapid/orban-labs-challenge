# Login

Authenticates a user with their email and password and returns a JWT access token. Unlike other endpoints, this one follows the OAuth2 password flow and expects a `application/x-www-form-urlencoded` body rather than JSON, with the email supplied in the `username` field.

---

**Endpoint**
```
POST /auth/login
```

---

**Request Body Example (form-encoded):**
```
username=login.user@example.com&password=Sup3rSecret!
```

---

**Response Example (`200 OK`):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600
  },
  "timestamp": "2026-07-17T09:24:36.597282+00:00"
}
```

Use the returned `access_token` as a `Bearer` token in the `Authorization` header when calling protected endpoints such as [Notes](../../notes/index.md).

---

**Failed Response Example — invalid credentials (`401 Unauthorized`):**
```json
{
  "success": false,
  "error": {
    "message": "Invalid email or password",
    "code": "UNAUTHORIZED",
    "details": {
      "exception": null,
      "message": null
    }
  },
  "timestamp": "2026-07-17T09:24:36.597282+00:00"
}
```

See [Error Responses](../../../errors.md) for the full error envelope reference.
