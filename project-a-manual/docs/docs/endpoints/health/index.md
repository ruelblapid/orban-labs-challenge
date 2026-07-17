# Health

A simple, unauthenticated health check endpoint used to verify that the service is running.

---

**Endpoint**
```
GET /health
```

---

**Response Example (`200 OK`):**
```json
{
  "healthpeak": "Ok",
  "timestamp": "2026-07-17T09:24:36.597282+00:00"
}
```
