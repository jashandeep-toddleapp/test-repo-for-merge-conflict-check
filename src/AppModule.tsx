import React, { useState, useEffect } from "react";

// Constants
export const MAX_RETRY_COUNT = 5;
export const API_ENDPOINT = "https://api.example.com/v1";
export const DEFAULT_TIMEOUT = 30000;
export const COLOR_PALETTE = {
  primary: "#4287f5",
  secondary: "#42c5f5",
  accent: "#f542a7",
  background: "#f5f5f5",
  error: "#f54242",
};

// Types
export interface UserData {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  role: "admin" | "user" | "guest";
}

export type RandomFunc = "1" | "2" | "3" | "4";

export type FetchStatus = "idle" | "loading" | "success" | "error";

// Utility Functions
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
};

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// React Components
export const LoadingSpinner: React.FC = () => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
};

export const ErrorBoundary: React.FC<{
  children: React.ReactNode;
  fallback: React.ReactNode;
}> = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  return hasError ? <>{fallback}</> : <>{children}</>;
};

export const useLocalStorage = <T,>(
  key: string,
  initialValue: T
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

// Sample business logic
export class DataProcessor {
  private data: number[];

  constructor(initialData: number[] = []) {
    this.data = initialData;
  }

  addValue(value: number): void {
    this.data.push(value);
  }

  getAverage(): number {
    if (this.data.length === 0) return 0;
    return this.data.reduce((sum, val) => sum + val, 0) / this.data.length;
  }

  getMax(): number {
    if (this.data.length === 0) return 0;
    return Math.max(...this.data);
  }

  reset(): void {
    this.data = [];
  }
}

// Mock API function
export async function fetchUserData(userId: string): Promise<UserData> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return mock data
  return {
    id: userId,
    name: "John Doe",
    email: "john.doe@example.com",
    createdAt: new Date(),
    role: "user",
  };
}
