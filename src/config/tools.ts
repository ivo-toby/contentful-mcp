import {
  ENTRY_TOOLS,
  ASSET_TOOLS,
  SPACE_ENV_TOOLS,
  CONTENT_TYPE_TOOLS,
} from "../types/tools.js";

// Define available tools with enhanced descriptions
export const TOOLS = {
  ...ENTRY_TOOLS, // Entry tools
  ...ASSET_TOOLS, // Asset tools
  ...SPACE_ENV_TOOLS, // Space & Environment tools
  {
    ...CONTENT_TYPE_TOOLS,
    list_content_types: {
      ...CONTENT_TYPE_TOOLS.list_content_types,
      description: "List content types in a space. Requires either spaceName or spaceId parameter to identify the target space."
    }
  }
};
