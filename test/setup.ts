import { beforeAll, expect } from 'vitest';
import dotenv from "dotenv";
import buffer from "buffer";

// Polyfill SlowBuffer which was removed from Node.js but is still required
// by buffer-equal-constant-time (a dependency of jsonwebtoken used by
// @contentful/node-apps-toolkit)
if (!buffer.SlowBuffer) {
  (buffer as typeof buffer & { SlowBuffer: typeof Buffer }).SlowBuffer = Buffer;
}

// Load environment variables from .env file
dotenv.config();

// Make sure we have the required environment variables
beforeAll(() => {
  const requiredEnvVars = ["CONTENTFUL_MANAGEMENT_ACCESS_TOKEN"];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
});

export { expect };
