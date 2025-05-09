#!/usr/bin/env node
/* eslint-disable no-undef */

async function main() {
  // Find the management token argument
  const tokenIndex = process.argv.findIndex((arg) => arg === "--management-token")
  if (tokenIndex !== -1 && process.argv[tokenIndex + 1]) {
    process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN = process.argv[tokenIndex + 1]
  }

  const hostIndex = process.argv.findIndex((arg) => arg === "--host")
  if (hostIndex !== -1 && process.argv[hostIndex + 1]) {
    process.env.CONTENTFUL_HOST = process.argv[hostIndex + 1]
  }

  const envIdIndex = process.argv.findIndex((arg) => arg === "--environment-id")
  if (envIdIndex !== -1 && process.argv[envIdIndex + 1]) {
    process.env.ENVIRONMENT_ID = process.argv[envIdIndex + 1]
  }

  const spaceIdIndex = process.argv.findIndex((arg) => arg === "--space-id")
  if (spaceIdIndex !== -1 && process.argv[spaceIdIndex + 1]) {
    process.env.SPACE_ID = process.argv[spaceIdIndex + 1]
  }

  const keyIdIndex = process.argv.findIndex((arg) => arg === "--private-key")
  if (keyIdIndex !== -1 && process.argv[keyIdIndex + 1]) {
    process.env.PRIVATE_KEY = process.argv[keyIdIndex + 1]
  }

  const appIdIndex = process.argv.findIndex((arg) => arg === "--app-id")
  if (appIdIndex !== -1 && process.argv[appIdIndex + 1]) {
    process.env.APP_ID = process.argv[appIdIndex + 1]
  }

  // Check for HTTP server mode flag
  const httpServerFlagIndex = process.argv.findIndex((arg) => arg === "--http")
  if (httpServerFlagIndex !== -1) {
    process.env.ENABLE_HTTP_SERVER = "true"

    // Check for HTTP port
    const httpPortIndex = process.argv.findIndex((arg) => arg === "--port")
    if (httpPortIndex !== -1 && process.argv[httpPortIndex + 1]) {
      process.env.HTTP_PORT = process.argv[httpPortIndex + 1]
    }

    // Check for HTTP host
    const httpHostIndex = process.argv.findIndex((arg) => arg === "--http-host")
    if (httpHostIndex !== -1 && process.argv[httpHostIndex + 1]) {
      process.env.HTTP_HOST = process.argv[httpHostIndex + 1]
    }
  }

  // Import and run the bundled server after env var is set
  await import("../dist/bundle.js")
}

main().catch((error) => {
  console.error("Failed to start server:", error)
  process.exit(1)
})
