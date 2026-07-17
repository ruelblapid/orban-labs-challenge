# Note JSON Structure Documentation

This document describes the JSON structure of a **Note** entity as returned by the API.

---

## Field Descriptions

| Field        | Type                 | Description |
|--------------|----------------------|-------------|
| `id`         | `string (UUID)`      | Unique identifier for the note. |
| `title`      | `string`             | Title of the note (1-255 characters). |
| `body`       | `string`             | Free-text content of the note. |
| `tags`       | `array[string]`      | Tags associated with the note, used for search and filtering. |
| `created_at` | `string (ISO 8601)`  | Timestamp when the note was created (UTC). |
| `updated_at` | `string (ISO 8601)`  | Timestamp when the note was last updated (UTC). |

---

## Example

```json
{
  "id": "0d9c9f2e-4b7a-4e3a-9e1a-1a2b3c4d5e6f",
  "title": "Groceries",
  "body": "Buy milk and eggs",
  "tags": ["home", "urgent"],
  "created_at": "2026-07-17T09:24:36.597282+00:00",
  "updated_at": "2026-07-17T09:24:36.597282+00:00"
}
```
