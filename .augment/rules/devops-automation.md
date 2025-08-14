---
type: "agent_requested"
description: "Example description"
---
# DevOps, Automation, and Operations Rules

# Part 1: CI/CD Pipeline Automation (Tự động hóa Tích hợp & Triển khai)
- After creating a new feature AND its corresponding tests, you MUST suggest a basic CI/CD pipeline configuration using **GitHub Actions**.
- The suggested pipeline (`.github/workflows/ci.yml`) should automate the following steps on every push to a feature branch or pull request:
  1.  Checkout code.
  2.  Set up the correct Node.js version.
  3.  Install dependencies (`npm install`).
  4.  Run the linter to check code style.
  5.  Run all tests (`npm test`).
- For pushes to the `main` or `develop` branch, the pipeline should include additional steps for building and deploying the application.

# Part 2: Infrastructure as Code (IaC) (Hạ tầng dưới dạng mã)
- When creating a new backend service, you MUST also generate a `Dockerfile`. This file should define the steps to build a lightweight, optimized production container image for the Node.js application.
- You should also suggest a `docker-compose.yml` file for the local development environment. This file should orchestrate the backend service, frontend service, and the database (e.g., MongoDB, PostgreSQL) so that a developer can start the entire stack with a single command (`docker-compose up`).

# Part 3: Observability & Monitoring (Giám sát & Quan sát)
- When creating new, critical API endpoints (e.g., payment, user creation), you MUST proactively suggest adding **observability** features:
  - **Structured Logging:** Use a library like `pino` or `winston` to log events in JSON format. All logs for a single request must include a unique `traceId` to allow for easy tracing.
  - **Metrics:** Suggest emitting key metrics to a monitoring system like Prometheus. For an API, this includes: latency (request duration), request rate, and error rate.
  - **Health Checks:** Suggest creating a dedicated `/health` endpoint that checks the status of the database connection and other critical dependencies.

# Part 4: Automated Security (DevSecOps)
- When defining the CI/CD pipeline, you MUST include a **security scanning stage**.
- This stage should run before the tests and include commands like `npm audit --audit-level=high` to automatically check for known vulnerabilities in the project's dependencies.