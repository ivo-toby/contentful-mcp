type Config = {
  spaceId?: string;
  environmentId?: string;
}

export const config: Config = {};

export function validateEnvironment(): void {
  const CONTENTFUL_MANAGEMENT_ACCESS_TOKEN = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;
  const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
  const CONTENTFUL_ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT_ID;

  if (!CONTENTFUL_MANAGEMENT_ACCESS_TOKEN) {
    console.error("CONTENTFUL_MANAGEMENT_ACCESS_TOKEN environment variable is not set");
    process.exit(1);
  }
  if (CONTENTFUL_SPACE_ID) config.spaceId = CONTENTFUL_SPACE_ID;
  if (CONTENTFUL_ENVIRONMENT_ID) config.environmentId = CONTENTFUL_ENVIRONMENT_ID;
}
