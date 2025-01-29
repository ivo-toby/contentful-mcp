#!/usr/bin/env node

async function main() {
  // Find the management token argument
  const tokenIndex = process.argv.findIndex(
    (arg) => arg === "--management-token",
  );
  if (tokenIndex !== -1 && process.argv[tokenIndex + 1]) {
    process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN =
      process.argv[tokenIndex + 1];
  }

  const hostIndex = process.argv.findIndex((arg) => arg === "--host");
  if (hostIndex !== -1 && process.argv[hostIndex + 1]) {
    process.env.CONTENTFUL_HOST = process.argv[hostIndex + 1];
  }

  // Import and run the bundled server after env var is set
  await import("../dist/bundle.js");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
