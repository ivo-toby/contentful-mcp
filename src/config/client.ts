import pkg from 'contentful-management';
const { createClient } = pkg;

const CONTENTFUL_MANAGEMENT_ACCESS_TOKEN = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;

if (!CONTENTFUL_MANAGEMENT_ACCESS_TOKEN) {
  console.error(
    "Contentful management token not found. Please provide it either:\n" +
    "1. As CONTENTFUL_MANAGEMENT_ACCESS_TOKEN environment variable\n" +
    "2. Using --management-token command line argument"
  );
  process.exit(1);
}

// Create the plain Contentful client
export const contentfulClient = createClient(
  {
    accessToken: CONTENTFUL_MANAGEMENT_ACCESS_TOKEN,
  },
  { type: "plain" },
);
