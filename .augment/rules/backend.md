---
type: "manual"
---

# Backend Development Standards

- All sensitive configurations MUST be loaded from a `.env` file. The names (keys) of these variables are immutable. The exact database name from the `.env` file must be used.
- All API endpoints (except public ones like login/register) MUST be protected by a JWT authentication middleware.
- Implement a centralized error-handling middleware.
- Use a validation library (`Joi`, `express-validator`) for all incoming request data.
- Use security middleware like `helmet` and `cors`.
- For search queries that yield no results, return a `200 OK` with a user-friendly message, not a `404 Not Found` error.