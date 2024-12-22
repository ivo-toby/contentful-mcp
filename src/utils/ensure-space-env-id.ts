import { SpaceProps } from "contentful-management";
import { spaceHandlers } from "../handlers/space-handlers.js";
import { contentfulClient } from "../config/client.js";

// Function to ensure spaceId and environmentId are provided and valid
export async function ensureSpaceAndEnvironment(args: {
  spaceName?: string;
  spaceId?: string;
  environmentId?: string;
}): Promise<{ spaceId: string; environmentId: string }> {
  if (!args.spaceId && args.spaceName) {
    const spacesResponse = await spaceHandlers.listSpaces();
    const spaces = JSON.parse(spacesResponse.content[0].text);
    const matchingSpace = spaces.items.find(
      (space: SpaceProps) => space.name === args.spaceName,
    );
    if (!matchingSpace) {
      throw new Error(`Space with name ${args.spaceName} not found.`);
    }
    args.spaceId = matchingSpace.sys.id;
  }

  if (!args.spaceId) {
    throw new Error(
      "spaceId is required. Please provide a spaceId or a spaceName to resolve it.",
    );
  }

  if (!args.environmentId) {
    args.environmentId = "master"; // Default environment
  }

  // Skip environment validation for environment creation
  if (!args.skipEnvironmentValidation) {
    try {
      const space = await contentfulClient.space.get({ spaceId: args.spaceId! });
      await space.getEnvironment(args.environmentId);
    } catch (error) {
      throw new Error("Environment not found");
    }
  }

  // At this point we know spaceId and environmentId are defined and valid
  return {
    spaceId: args.spaceId!,
    environmentId: args.environmentId!,
  };
}
