import { ENTRY_TOOLS, ASSET_TOOLS, SPACE_ENV_TOOLS } from '../types/tools.js';

// Define available tools
export const TOOLS = {
  ...ENTRY_TOOLS,  // Entry tools
  ...ASSET_TOOLS,  // Asset tools
  ...SPACE_ENV_TOOLS,  // Space & Environment tools
};
