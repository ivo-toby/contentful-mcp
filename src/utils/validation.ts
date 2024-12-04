export function validateEnvironment(): void {
  const CONTENTFUL_MANAGEMENT_ACCESS_TOKEN = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;

  if (!CONTENTFUL_MANAGEMENT_ACCESS_TOKEN) {
    console.error("CONTENTFUL_MANAGEMENT_ACCESS_TOKEN environment variable is not set");
    process.exit(1);
  }
}
