import React from "react";

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

export type FetchStatus = "idle" | "loading" | "success" | "error";
