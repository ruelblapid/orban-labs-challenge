# Authentication Endpoints Overview

This section documents the authentication endpoints of the Notes API. These endpoints let a client register a new user and exchange credentials for a JWT access token.

---

## Key Authentication Flows

- **Register**: Create a new user account with an email and password.
- **Login**: Authenticate with email and password and receive a bearer access token.

---

## Security

Once a client has an access token, it must be sent as an `Authorization: Bearer <token>` header on every subsequent request to a protected endpoint (e.g. the [Notes](../notes/index.md) endpoints). Requests without a valid token receive a `401 Unauthorized` response.

---

## Supported Actions

- [Register](examples/register.md)
- [Login](examples/login.md)

---

Refer to the individual endpoint documentation for request/response examples.
