import { GetPromptResult } from "@modelcontextprotocol/sdk/types"
import { contentfulHandlers } from "./promptHandlers/contentful"
import { aiActionsHandlers } from "./promptHandlers/aiActions"
import { graphqlHandlers } from "./promptHandlers/graphql"

// Define the correct GetPromptResult interface to match SDK requirements
interface MessageContent {
  type: "text"
  text: string
}

interface Message {
  role: "user" | "assistant"
  content: MessageContent
}

export interface PromptResult {
  messages: Message[]
  tools?: any[] // Add tools property to match expected result type
}

/**
 * Handle a prompt request and return the appropriate response
 * @param name Prompt name
 * @param args Optional arguments provided for the prompt
 * @returns Prompt result with messages
 */
// Tools will be added by the server code at runtime
const emptyToolsArray: any[] = []

export async function handlePrompt(
  name: string,
  args?: Record<string, string>,
): Promise<PromptResult> {
  let result: PromptResult;

  // Check for AI Actions handlers
  if (name.startsWith("ai-actions-") && name in aiActionsHandlers) {
    result = await aiActionsHandlers[name as keyof typeof aiActionsHandlers](args)
  }
  // Check for GraphQL-related handlers
  else if (
    (name === "explore-graphql-schema" || name === "build-graphql-query") &&
    name in graphqlHandlers
  ) {
    result = await graphqlHandlers[name as keyof typeof graphqlHandlers](args)
  }
  // Check for general Contentful handlers
  else if (name in contentfulHandlers) {
    result = await contentfulHandlers[name as keyof typeof contentfulHandlers](args)
  }
  // Handle unknown prompts
  else {
    throw new Error(`Unknown prompt: ${name}`)
  }

  // Tools will be added by the server code
  result.tools = emptyToolsArray

  return result
}

