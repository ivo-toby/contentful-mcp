export function validateEnvironment(): void {
  const {
    CONTENTFUL_MANAGEMENT_ACCESS_TOKEN,
    PRIVATE_KEY,
    APP_ID,
    SPACE_ID,
    ENVIRONMENT_ID,
    ENABLE_HTTP_SERVER,
    HTTP_PORT
  } = process.env

  if (!CONTENTFUL_MANAGEMENT_ACCESS_TOKEN && !PRIVATE_KEY) {
    console.error("Either CONTENTFUL_MANAGEMENT_ACCESS_TOKEN or PRIVATE_KEY must be set")
    process.exit(1)
  }

  if (PRIVATE_KEY) {
    if (!APP_ID) {
      console.error("APP_ID is required when using PRIVATE_KEY")
      process.exit(1)
    }
    if (!SPACE_ID) {
      console.error("SPACE_ID is required when using PRIVATE_KEY")
      process.exit(1)
    }
    if (!ENVIRONMENT_ID) {
      console.error("ENVIRONMENT_ID is required when using PRIVATE_KEY")
      process.exit(1)
    }
  }

  // Validate HTTP server settings if enabled
  if (ENABLE_HTTP_SERVER === "true") {
    if (HTTP_PORT) {
      const port = parseInt(HTTP_PORT)
      if (isNaN(port) || port < 1 || port > 65535) {
        console.error("HTTP_PORT must be a valid port number (1-65535)")
        process.exit(1)
      }
    }
  }
}
