export function getSpaceAndEnvironment(args: { spaceId?: string; environmentId?: string }) {
  const spaceId = args.spaceId || process.env.CONTENTFUL_SPACE_ID;
  const environmentId = args.environmentId || process.env.CONTENTFUL_ENVIRONMENT_ID || "master";

  if (!spaceId) {
    throw new Error("No spaceId provided and CONTENTFUL_SPACE_ID environment variable is not set");
  }

  return { spaceId, environmentId };
}
