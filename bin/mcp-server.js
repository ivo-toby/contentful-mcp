#!/usr/bin/env node

// Find the management token argument
const tokenIndex = process.argv.findIndex(arg => arg === '--management-token');
if (tokenIndex !== -1 && process.argv[tokenIndex + 1]) {
  process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN = process.argv[tokenIndex + 1];
}

// Import and run the bundled server
import "../dist/bundle.js";
