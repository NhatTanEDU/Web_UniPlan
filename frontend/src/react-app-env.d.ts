/// <reference types="react-scripts" />

// Extend ProcessEnv interface to include our custom environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PUBLIC_URL: string;
    readonly REACT_APP_API_URL: string;
    // Add other environment variables as needed
    readonly REACT_APP_APP_TITLE?: string;
    readonly REACT_APP_APP_VERSION?: string;
    readonly REACT_APP_ENVIRONMENT?: string;
  }
}
