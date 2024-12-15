import { getTools } from "../types/tools.js";
import { config } from "../utils/validation.js";

// Define available tools
export const TOOLS = getTools(config);
