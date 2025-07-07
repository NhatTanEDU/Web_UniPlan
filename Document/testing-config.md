# Test Configuration for UniPlan

## Frontend Testing Setup

### Jest Configuration
```json
{
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": ["<rootDir>/src/setupTests.ts"],
  "moduleNameMapping": {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/index.tsx",
    "!src/reportWebVitals.ts"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 70,
      "functions": 70,
      "lines": 70,
      "statements": 70
    }
  }
}
```

### ESLint Configuration
```json
{
  "extends": [
    "react-app",
    "react-app/jest",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

## Backend Testing Setup

### Mocha/Chai Configuration
```json
{
  "mocha": {
    "require": ["ts-node/register"],
    "extensions": ["ts"],
    "spec": "test/**/*.spec.ts",
    "timeout": 5000
  }
}
```

## Environment Variables for Testing
- NODE_ENV=test
- DATABASE_URL=mongodb://localhost:27017/uniplan_test
- JWT_SECRET=test_secret_key
- PORT=3001

Created: May 24, 2025
