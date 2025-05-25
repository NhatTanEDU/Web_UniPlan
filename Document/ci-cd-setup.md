# CI/CD Pipeline Configuration

This file demonstrates automated testing and deployment setup for UniPlan project.

## GitHub Actions Workflow

```yaml
name: UniPlan CI/CD
on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Install dependencies
      run: |
        cd frontend && npm install
        cd ../backend && npm install
    - name: Run tests
      run: |
        cd frontend && npm test
        cd ../backend && npm test
```

## Features
- Automated testing on push/PR
- Multi-environment deployment
- Code quality checks
- Security scanning

Created: May 24, 2025
