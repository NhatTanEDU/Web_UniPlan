export interface User {
    _id: string;
    name: string;
    email: string;
    password?: string; // optional
    createdAt?: string;
    updatedAt?: string;
  }
  