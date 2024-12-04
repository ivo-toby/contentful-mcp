import { createClient } from "contentful-management";

const CONTENTFUL_MANAGEMENT_ACCESS_TOKEN = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;

if (!CONTENTFUL_MANAGEMENT_ACCESS_TOKEN) {
  console.error("CONTENTFUL_MANAGEMENT_ACCESS_TOKEN environment variable is not set");
  process.exit(1);
}

// Create the plain Contentful client
export const contentfulClient = createClient(
  {
    accessToken: CONTENTFUL_MANAGEMENT_ACCESS_TOKEN,
  },
  { type: "plain" }
);
