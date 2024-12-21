import { CollectionProp, SpaceProps } from "contentful-management";
import { spaceHandlers } from "../handlers/space-handlers.js";

// Function to ensure spaceId and environmentId are provided
export async function ensureSpaceAndEnvironment(args: {
  spaceName?: string;
  spaceId?: string;
  environmentId?: string;
}): Promise<{ spaceId: string; environmentId: string }> {
  if (!args.spaceId && args.spaceName) {
    const spacesResponse = await spaceHandlers.listSpaces();
    const spaces: CollectionProp<SpaceProps> = spacesResponse.content;
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

  // At this point we know spaceId and environmentId are defined
  return {
    spaceId: args.spaceId!,
    environmentId: args.environmentId!
  };
}
