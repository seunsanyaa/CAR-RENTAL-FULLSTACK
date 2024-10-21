// src/types/env.d.ts

/// <reference types="next" />
/// <reference types="next/types/global" />
/// <reference types="next/image-types/global" />

declare namespace NodeJS {
  interface ProcessEnv {
    CAR_QUERY_API_BASE: string;
    // Add other environment variables here
  }
}
