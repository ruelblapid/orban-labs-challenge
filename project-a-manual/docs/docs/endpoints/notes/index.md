# Notes Endpoint Overview

The Notes endpoint lets an authenticated user manage personal notes: create, list, search, retrieve, update, and delete. Every route under `/notes` requires a valid `Authorization: Bearer <token>` header — see [Authentication](../authentication/index.md) for how to obtain one. Requests without a valid token receive `401 Unauthorized`.

Notes are strictly scoped to the authenticated user: list and search only ever return the caller's own notes, and retrieving, updating, or deleting a note that belongs to another user returns `404 Not Found` (the same response as a note that doesn't exist at all, so a request can't be used to probe for the existence of someone else's notes).

---

## Features

- **Create Notes:** Add a note with a title, body, and optional tags.
- **List Notes:** Page through notes with `limit`/`offset` query parameters.
- **Search Notes:** Find notes by tag or by a keyword match in the title/body.
- **Retrieve Notes:** Fetch a single note by its id.
- **Update Notes:** Partially update a note's title, body, or tags.
- **Delete Notes:** Remove a note permanently.

---

## Supported Actions

- [Create a Note](examples/create.md)
- [List Notes](examples/list.md)
- [Search Notes](examples/search.md)
- [Retrieve a Note](examples/retrieve.md)
- [Update a Note](examples/update.md)
- [Delete a Note](examples/delete.md)

---

## Entity Reference

For details about the Note entity structure, see [Note Entity](entities/index.md).
