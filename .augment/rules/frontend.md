---
type: "agent_requested"
description: "Example description"
---
# Frontend Development Standards

- Create a dedicated API abstraction layer in `/src/services` or `/src/api` to centralize all API calls.
- Create a centralized design system file (`/src/theme.js`) for design tokens like colors and typography. All components must use these tokens instead of hardcoded values.
- Every color and font size in the theme file must have a preceding Vietnamese comment explaining its semantic purpose (e.g., `// Màu đỏ, dùng cho thông báo lỗi`).
- Create a `/src/components/common` directory for reusable UI components like Button, Input, etc.