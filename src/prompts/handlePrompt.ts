import { GetPromptResult } from "@modelcontextprotocol/sdk/types";
import { contentfulHandlers } from "./promptHandlers/contentful";
import { aiActionsHandlers } from "./promptHandlers/aiActions";

/**
 * Handle a prompt request and return the appropriate response
 * @param name Prompt name
 * @param args Optional arguments provided for the prompt
 * @returns Prompt result with messages
 */
export async function handlePrompt(
  name: string,
  args?: Record<string, string>,
): Promise<GetPromptResult> {
  // Check for AI Actions handlers
  if (name.startsWith("ai-actions-") && name in aiActionsHandlers) {
    return aiActionsHandlers[name as keyof typeof aiActionsHandlers](args);
  }
  
  // Check for general Contentful handlers
  if (name in contentfulHandlers) {
    return contentfulHandlers[name as keyof typeof contentfulHandlers](args);
  }
  
  // Handle unknown prompts
  throw new Error(`Unknown prompt: ${name}`);
}