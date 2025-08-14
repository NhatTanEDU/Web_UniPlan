---
type: "agent_requested"
description: "Example description"
---
# Project Architecture & Naming Conventions

- Use lowercase, kebab-case for all file and directory names (e.g., `user-profile`, `api-helpers.js`).
- Group files by feature/domain, not just by file type.
- Implement a layered architecture for the backend: `/routes`, `/controllers`, `/services`, `/models`, `/middlewares`.
- All backend API routes must be versioned, e.g., `/src/routes/v1/users.routes.js`.