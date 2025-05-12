export function validateEnvironment(): void {
  const {
    CONTENTFUL_MANAGEMENT_ACCESS_TOKEN,
    CONTENTFUL_DELIVERY_ACCESS_TOKEN,
    PRIVATE_KEY,
    APP_ID,
    SPACE_ID,
    ENVIRONMENT_ID,
    ENABLE_HTTP_SERVER,
    HTTP_PORT
  } = process.env

  // Determine authorization mode based on provided credentials
  const hasCmaToken = !!CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;
  const hasCdaToken = !!CONTENTFUL_DELIVERY_ACCESS_TOKEN;
  const hasPrivateKey = !!PRIVATE_KEY;

  // Check if we have at least one authentication method
  if (!hasCmaToken && !hasPrivateKey && !hasCdaToken) {
    console.error("Either CONTENTFUL_MANAGEMENT_ACCESS_TOKEN, CONTENTFUL_DELIVERY_ACCESS_TOKEN, or PRIVATE_KEY must be set")
    process.exit(1)
  }

  // When only CDA token is provided, inform that only GraphQL operations will be available
  if (hasCdaToken && !hasCmaToken && !hasPrivateKey) {
    console.warn("Only CONTENTFUL_DELIVERY_ACCESS_TOKEN is provided. Only GraphQL operations will be available.")
  }

  // Requirements when using private key
  if (hasPrivateKey) {
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
