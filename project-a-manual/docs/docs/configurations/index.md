# Configuration Overview

The Notes API is configured through environment variables, read via `python-decouple`. All variables are optional and fall back to sensible development defaults.

| Variable               | Description                                                        | Default                       |
|-------------------------|----------------------------------------------------------------------|--------------------------------|
| `DATABASE_URL`          | SQLAlchemy connection string for the notes/users database.           | `sqlite:///./notes.db`        |
| `JWT_SECRET_KEY`        | Secret key used to sign and verify JWT access tokens.                 | `change-me-in-production`     |
| `JWT_ALGORITHM`         | Algorithm used to sign JWT access tokens.                             | `HS256`                       |
| `JWT_EXPIRES_MINUTES`   | Access token lifetime, in minutes.                                     | `60`                           |

!!! warning
    Always override `JWT_SECRET_KEY` and `DATABASE_URL` outside of local development. The defaults are not safe for production use.

Create a `.env` file in the `backend` directory to override any of these values locally.
