---
type: "manual"
---

# Database Best Practices

- For SQL, all schema changes must be managed via migration files.
- Proactively suggest creating database indexes on frequently queried fields.
- Wrap multiple related database writes in a transaction to ensure data integrity.
- Use a database connection pool.
- For fields representing a state or role, you MUST enforce a sensible default value (e.g., `role: 'member'`) at the model/schema level and forbid `NULL` values.