# Error Responses

Every failed request returns the same JSON envelope, regardless of which endpoint raised it.

```json
{
  "success": false,
  "error": {
    "message": "Human-readable description of what went wrong",
    "code": "MACHINE_READABLE_CODE",
    "details": {
      "exception": null,
      "message": null
    }
  },
  "timestamp": "2026-07-17T09:24:36.597282+00:00"
}
```

| Field             | Description |
|-------------------|-------------|
| `success`         | Always `false` for error responses. |
| `error.message`   | Human-readable description of the failure. |
| `error.code`      | Machine-readable error code, derived from the HTTP status (e.g. `NOT_FOUND`, `UNAUTHORIZED`). |
| `error.details`   | Extra diagnostic context. Populated with the underlying exception class/message when the error was unexpected. |
| `timestamp`       | UTC timestamp (ISO 8601) of when the error occurred. |

## Validation Errors

Request body validation failures (`422 Unprocessable Entity`) include the field-level Pydantic validation errors under `error.details.details`:

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "UNPROCESSABLE_ENTITY",
    "details": [
      {
        "type": "string_too_short",
        "loc": ["body", "title"],
        "msg": "String should have at least 1 character",
        "input": ""
      }
    ]
  }
}
```

## Common Status Codes

| Status | Code                  | Typical Cause |
|--------|------------------------|---------------|
| 401    | `UNAUTHORIZED`          | Missing, invalid, or expired access token; wrong login credentials. |
| 404    | `NOT_FOUND`             | The requested resource (e.g. a note) does not exist. |
| 409    | `CONFLICT`              | Attempting to register an email that is already taken. |
| 422    | `UNPROCESSABLE_ENTITY`  | Request body fails validation, or required query parameters are missing. |
| 500    | `INTERNAL_SERVER_ERROR` | An unexpected server error occurred. |
